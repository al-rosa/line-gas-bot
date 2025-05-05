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
/**
 * Copyright 2025 aran sekimoto
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

import { MessageConstants } from '../constants/messageConstants';
import { LineEvent } from '../models/lineEvent';
import { Message } from '../models/message';
import { DefaultHandler } from './defaultHandler';

/**
 * ポストバックハンドラークラス
 */
export class PostbackHandler extends DefaultHandler {
  /**
   * ポストバックの処理
   * @param {LineEvent} event LINEイベント
   */
  public handle(event: LineEvent): void {
    try {
      this.logger.log(
        `PostbackHandler handling postback: ${event.postback?.data}`
      );

      // ユーザーIDとポストバックデータを取得
      const userId = event.source.userId;
      const postbackData = event.postback?.data || '';

      if (!userId || !postbackData) {
        return;
      }

      // ポストバックデータをパース
      const params = this.parsePostbackData(postbackData);

      // メッセージをログとして保存
      const message = new Message(userId, 'postback', { postbackData, params });
      message.save();

      // アクションに応じた処理
      let response = MessageConstants.UNKNOWN_ACTION;

      // ポストバックアクションを処理
      switch (params.action) {
        case 'help':
          response = MessageConstants.HELP;
          break;

        // その他のポストバックアクション処理をここに追加

        default:
          response = MessageConstants.UNKNOWN_ACTION;
          break;
      }

      // メッセージを返信
      this.lineService.replyText(event.replyToken || '', response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`PostbackHandler error: ${error.message}`);
      } else {
        this.logger.error(`PostbackHandler error: ${String(error)}`);
      }

      // エラー時の応答
      if (event.replyToken) {
        this.lineService.replyText(event.replyToken, MessageConstants.ERROR);
      }
    }
  }

  /**
   * ポストバックデータをパース
   * @param {string} data ポストバックデータ文字列
   * @return {Record<string, string>} パース結果
   */
  private parsePostbackData(data: string): Record<string, string> {
    const result: Record<string, string> = {};

    try {
      // クエリパラメータ形式のポストバックデータを解析
      data.split('&').forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          result[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Parse postback data error: ${error.message}`);
      } else {
        this.logger.error(`Parse postback data error: Unknown error`);
      }
    }

    return result;
  }
}
