/**
 * Copyright 2025 al-rosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Config } from '../config/config';
import { MessageConstants } from '../constants/messageConstants';
import { Logger } from '../utils/logger';

/**
 * LINE APIサービスクラス
 */
export class LineService {
  private static instance: LineService;
  private config: Config;
  private accessToken: string;
  private logger: Logger;
  private readonly MAX_MESSAGE_LENGTH = 4000; // LINEの制限は4096だが、余裕を持たせる

  /**
   * コンストラクタ
   */
  private constructor() {
    this.config = Config.getInstance();
    this.accessToken = this.config.getLineChannelAccessToken();
    this.logger = Logger.getInstance();
  }

  /**
   * シングルトンインスタンスを取得
   * @return {LineService} LineServiceインスタンス
   */
  public static getInstance(): LineService {
    if (!LineService.instance) {
      LineService.instance = new LineService();
    }
    return LineService.instance;
  }

  /**
   * テキストメッセージを返信
   * @param {string} replyToken 返信トークン
   * @param {string} text メッセージテキスト
   * @return {object} レスポンス
   */
  public replyText(replyToken: string, text: string): object {
    const url = 'https://api.line.me/v2/bot/message/reply';
    const payload = {
      replyToken: replyToken,
      messages: [
        {
          type: 'text',
          text: text,
        },
      ],
    };

    return this.post(url, payload);
  }

  /**
   * テキストメッセージを送信（Push API使用）
   * @param {string} userId ユーザーID
   * @param {string} text メッセージテキスト
   * @return {object} レスポンス
   */
  public pushText(userId: string, text: string): object {
    const url = 'https://api.line.me/v2/bot/message/push';
    const payload = {
      to: userId,
      messages: [
        {
          type: 'text',
          text: text,
        },
      ],
    };

    return this.post(url, payload);
  }

  /**
   * 長いメッセージを複数回に分けて送信
   * @param {string} userId ユーザーID
   * @param {string} replyToken 返信トークン（最初のメッセージのみで使用）
   * @param {string} text 送信するテキスト
   * @return {boolean} 送信成功したかどうか
   */
  public sendLongMessage(
    userId: string,
    replyToken: string,
    text: string
  ): boolean {
    try {
      // テキストが最大長を超えない場合は普通に返信
      if (text.length <= this.MAX_MESSAGE_LENGTH) {
        this.replyText(replyToken, text);
        return true;
      }

      // 長いメッセージを分割して送信
      // 1回目はreplyTokenを使用
      const firstPart = text.substring(0, this.MAX_MESSAGE_LENGTH);
      this.replyText(replyToken, firstPart);

      // 残りのテキストを分割して送信（Push API使用）
      let remainingText = text.substring(this.MAX_MESSAGE_LENGTH);
      let messageCount = 1; // 最初のメッセージは既に送信済み

      while (remainingText.length > 0) {
        // Push APIの呼び出し回数制限を考慮して、適度な待機時間を入れる
        Utilities.sleep(500);

        const currentPart =
          remainingText.length > this.MAX_MESSAGE_LENGTH
            ? remainingText.substring(0, this.MAX_MESSAGE_LENGTH)
            : remainingText;

        // 2回目以降のメッセージには、続きであることを示す接頭辞を付ける
        this.pushText(
          userId,
          MessageConstants.ANALYSIS_CONTINUED + currentPart
        );

        remainingText = remainingText.substring(currentPart.length);
        messageCount++;
      }

      this.logger.log(`Sent long message in ${messageCount} parts`);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error in sendLongMessage: ${error.message}`);
      } else {
        this.logger.error(`Unknown error in sendLongMessage: ${String(error)}`);
      }
      return false;
    }
  }

  /**
   * ローディングアニメーションを送信
   * @param {string} userId ユーザーID
   * @param {number} loadingSeconds ローディング時間（秒）デフォルトは20秒
   */
  public sendLoadingAnimation(userId: string, loadingSeconds = 20): void {
    const url = 'https://api.line.me/v2/bot/chat/loading/start';
    const payload = {
      chatId: userId,
      loadingSeconds: loadingSeconds,
    };

    this.post(url, payload);
  }

  /**
   * 画像コンテンツを取得
   * @param {string} messageId メッセージID
   * @return {GoogleAppsScript.Base.Blob | null} 画像Blob
   */
  public getContent(messageId: string): GoogleAppsScript.Base.Blob | null {
    try {
      const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
      const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: 'get',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        muteHttpExceptions: true,
      };

      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();

      if (responseCode === 200) {
        // ヘッダーを取得し、型を明示的に指定
        const headers = response.getHeaders() as Record<string, string>;
        const contentType =
          headers['Content-Type'] || 'application/octet-stream';

        return response
          .getBlob()
          .setName(
            `line_image_${messageId}.${this.getExtensionFromMimeType(contentType)}`
          );
      } else {
        this.logger.error(
          `Error getting content: ${response.getContentText()}`
        );
        return null;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error in getContent: ${error.message}`);
      } else {
        this.logger.error(`Unknown error in getContent: ${String(error)}`);
      }
      return null;
    }
  }

  /**
   * MIMEタイプから拡張子を取得
   * @param {string} mimeType MIMEタイプ
   * @return {string} ファイル拡張子
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeTypeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    return mimeTypeMap[mimeType] || 'jpg';
  }

  /**
   * POSTリクエスト送信
   * @param {string} url エンドポイントURL
   * @param {object} payload リクエストペイロード
   * @return {object} レスポンス
   */
  private post(url: string, payload: object): object {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();

      this.logger.log(`LINE API response code: ${responseCode}`);

      if (responseCode >= 400) {
        this.logger.error(`LINE API error: ${responseBody}`);
      }

      return {
        code: responseCode,
        body: responseBody,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error in post: ${error.message}`);
      } else {
        this.logger.error(`Unknown error in post: ${String(error)}`);
      }

      return {
        code: 500,
        body: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
