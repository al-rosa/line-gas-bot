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
import { DefaultHandler } from '../handlers/defaultHandler';
import { IHandler } from '../handlers/iHandler';
import { ImageHandler } from '../handlers/imageHandler';
import { PostbackHandler } from '../handlers/postbackHandler';
import { TextHandler } from '../handlers/textHandler';
import { LineEvent } from '../models/lineEvent';

/**
 * ハンドラーファクトリークラス
 */
export class HandlerFactory {
  /**
   * イベントタイプに応じたハンドラーを生成
   * @param {LineEvent} event LINEイベント
   * @return {IHandler} ハンドラーインスタンス
   */
  public static createHandler(event: LineEvent): IHandler {
    // イベントタイプに基づいてハンドラーを作成
    if (event.type === 'message') {
      // メッセージイベントのハンドラー
      switch (event.message?.type) {
        case 'text':
          return new TextHandler();
        case 'image':
          return new ImageHandler();
        default:
          return new DefaultHandler();
      }
    } else if (event.type === 'postback') {
      // ポストバックイベントのハンドラー
      return new PostbackHandler();
    }

    // デフォルトハンドラー
    return new DefaultHandler();
  }
}
