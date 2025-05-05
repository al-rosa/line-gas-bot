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
import { SpreadsheetService } from '../services/spreadsheetService';
import { Logger } from '../utils/logger';

/**
 * メッセージデータの型定義
 */
export interface MessageData {
  userId: string;
  type: string;
  content: string; // JSON文字列
  timestamp: Date | string;
}

/**
 * スプレッドシートから取得するメッセージデータの型定義
 */
export type MessageRow = [string, string, string, Date | string];

/**
 * メッセージモデルクラス
 */
export class Message {
  public userId: string;
  public type: string;
  public content: Record<string, unknown>;
  public timestamp: Date;

  /**
   * コンストラクタ
   * @param {string} userId 送信者ユーザーID
   * @param {string} type メッセージタイプ
   * @param {Record<string, unknown>} content メッセージ内容
   */
  constructor(userId: string, type: string, content: Record<string, unknown>) {
    this.userId = userId;
    this.type = type;
    this.content = content;
    this.timestamp = new Date();
  }

  /**
   * メッセージをスプレッドシートに保存
   * @return {boolean} 保存成功かどうか
   */
  public save(): boolean {
    try {
      const ss = SpreadsheetService.getInstance();
      const messageData: MessageRow = [
        this.userId,
        this.type,
        JSON.stringify(this.content),
        this.timestamp,
      ];

      ss.saveMessageData(messageData);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.getInstance().error(`Message save error: ${error.message}`);
      } else {
        Logger.getInstance().error('Message save error: Unknown error');
      }
      return false;
    }
  }

  /**
   * ユーザーIDでメッセージ履歴を取得
   * @param {string} userId LINEユーザーID
   * @param {number} limit 取得件数上限
   * @return {Array<Message>} メッセージ履歴
   */
  public static getHistoryByUserId(userId: string, limit = 10): Message[] {
    try {
      const ss = SpreadsheetService.getInstance();
      const messagesData = ss.getMessagesByUserId(userId, limit);

      return messagesData.map(data => {
        const [userId, type, contentStr, timestamp] = data;
        const message = new Message(
          userId,
          type,
          JSON.parse(contentStr || '{}')
        );
        message.timestamp =
          timestamp instanceof Date ? timestamp : new Date(String(timestamp));
        return message;
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.getInstance().error(
          `Get message history error: ${error.message}`
        );
      } else {
        Logger.getInstance().error('Get message history error: Unknown error');
      }
      return [];
    }
  }
}
