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
 * 画像メッセージハンドラークラス
 */
export class ImageHandler extends DefaultHandler {
  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  /**
   * 画像メッセージの処理
   * @param {LineEvent} event LINEイベント
   */
  public handle(event: LineEvent): void {
    try {
      this.logger.log(`ImageHandler handling image message`);

      // ユーザーIDとイメージIDを取得
      const userId = event.source.userId;
      const messageId = event.message?.id;

      if (!userId || !messageId) {
        this.logger.error('Missing userId or messageId');
        return;
      }

      // メッセージをログとして保存
      const message = new Message(userId, 'image', { messageId });
      message.save();

      // 画像を受け取ったことをリプライ
      this.lineService.sendLoadingAnimation(userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`ImageHandler error: ${error.message}`);
      } else {
        this.logger.error(`ImageHandler error: ${String(error)}`);
      }

      // エラー時の応答
      if (event.replyToken) {
        this.lineService.replyText(event.replyToken, MessageConstants.ERROR);
      }
    }
  }

  /**
   * 非同期で画像分析を行う
   * @param {string} messageId メッセージID
   * @param {string} userId ユーザーID
   * @param {string} replyToken 返信トークン
   */
  public processImageAsync(messageId: string): void {
    try {
      // LINE APIから画像をダウンロード
      const imageBlob = this.lineService.getContent(messageId);
      if (!imageBlob) {
        this.logger.error('Failed to download image from LINE');
        return;
      }

      this.logger.log(
        `Downloaded image: ${imageBlob.getName()}, size: ${imageBlob.getBytes().length} bytes`
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error in processImageAsync: ${error.message}`);
      } else {
        this.logger.error(
          `Unknown error in processImageAsync: ${String(error)}`
        );
      }
    }
  }
}
