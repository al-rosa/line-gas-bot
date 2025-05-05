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

import { LineEvent } from '../models/lineEvent';
import { LineService } from '../services/lineService';
import { Logger } from '../utils/logger';
import { IHandler } from './iHandler';

/**
 * デフォルトハンドラー
 * 未対応のイベントタイプを処理する基本クラス
 */
export class DefaultHandler implements IHandler {
  protected lineService: LineService;
  protected logger: Logger;

  /**
   * コンストラクタ
   */
  constructor() {
    this.lineService = LineService.getInstance();
    this.logger = Logger.getInstance();
  }

  /**
   * イベント処理の基本メソッド
   * @param {LineEvent} event LINEイベント
   */
  public handle(event: LineEvent): void {
    try {
      this.logger.log(`DefaultHandler handling event type: ${event.type}`);

      // リプライトークンがある場合のみ返信
      if (event.replyToken) {
        this.logger.log(
          `DefaultHandler replying to event with replyToken: ${event.replyToken}`
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`DefaultHandler error: ${error.message}`);
      } else {
        this.logger.error('DefaultHandler encountered an unknown error.');
      }
    }
  }
}
