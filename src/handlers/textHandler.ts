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
import { MessageConstants } from '../constants/messageConstants';
import { StatusConstants } from '../constants/statusConstants';
import { LineEvent } from '../models/lineEvent';
import { Message } from '../models/message';
import { User } from '../models/user';
import { MessageFormatter } from '../utils/messageFormatter';
import { DefaultHandler } from './defaultHandler';

/**
 * テキストメッセージハンドラークラス
 */
export class TextHandler extends DefaultHandler {
  /**
   * テキストメッセージの処理
   * @param {LineEvent} event LINEイベント
   */
  public handle(event: LineEvent): void {
    try {
      this.logger.log(`TextHandler handling message: ${event.message?.text}`);

      // ユーザーIDとテキストを取得
      const userId = event.source.userId;
      const text = event.message?.text || '';

      if (!userId || !text) {
        return;
      }

      // メッセージをログとして保存
      const message = new Message(userId, 'text', { text });
      message.save();

      // ユーザー情報を取得または新規作成
      let user = User.findByUserId(userId);
      if (!user) {
        user = new User(userId);
        user.save();
      }

      // ユーザーの状態に応じた処理
      let response: string;

      switch (user.state) {
        case StatusConstants.INITIAL:
          response = this.handleInitialState(text, user);
          break;

        case StatusConstants.WAITING_NAME:
          response = this.handleWaitingNameState(text, user);
          break;

        case StatusConstants.WAITING_AGE:
          response = this.handleWaitingAgeState(text, user);
          break;

        case StatusConstants.REGISTERED:
          response = this.handleRegisteredState(text, user);
          break;

        default:
          response = MessageConstants.ERROR;
          break;
      }

      // メッセージを返信
      this.lineService.replyText(event.replyToken || '', response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`TextHandler error: ${error.message}`);
      } else {
        this.logger.error('TextHandler encountered an unknown error');
      }

      // エラー時の応答
      if (event.replyToken) {
        this.lineService.replyText(event.replyToken, MessageConstants.ERROR);
      }
    }
  }

  /**
   * 初期状態のメッセージ処理
   * @param {string} text メッセージテキスト
   * @param {User} user ユーザーオブジェクト
   * @return {string} 応答メッセージ
   */
  private handleInitialState(text: string, user: User): string {
    if (text === '登録') {
      user.updateState(StatusConstants.WAITING_NAME);
      return MessageConstants.REGISTRATION_START;
    } else if (text === 'ヘルプ') {
      return MessageConstants.HELP;
    } else {
      return MessageConstants.WELCOME;
    }
  }

  /**
   * 名前入力待ち状態の処理
   * @param {string} text メッセージテキスト
   * @param {User} user ユーザーオブジェクト
   * @return {string} 応答メッセージ
   */
  private handleWaitingNameState(text: string, user: User): string {
    if (text.trim().length < 2) {
      return MessageConstants.INVALID_NAME;
    }

    // 名前を保存
    user.updateData({ name: text });
    user.updateState(StatusConstants.WAITING_AGE);

    return MessageFormatter.format(MessageConstants.NAME_CONFIRMED, {
      name: text,
    });
  }

  /**
   * 年齢入力待ち状態の処理
   * @param {string} text メッセージテキスト
   * @param {User} user ユーザーオブジェクト
   * @return {string} 応答メッセージ
   */
  private handleWaitingAgeState(text: string, user: User): string {
    const age = parseInt(text);

    if (isNaN(age) || age < 1 || age > 120) {
      return MessageConstants.INVALID_AGE;
    }

    // 年齢を保存
    user.updateData({ age });
    user.updateState(StatusConstants.REGISTERED);

    return MessageFormatter.format(MessageConstants.REGISTRATION_COMPLETED, {
      name: user.data.name || '',
      age: age.toString(),
    });
  }

  /**
   * 登録済み状態の処理
   * @param {string} text メッセージテキスト
   * @param {User} user ユーザーオブジェクト
   * @return {string} 応答メッセージ
   */
  private handleRegisteredState(text: string, user: User): string {
    if (text === 'ヘルプ') {
      return MessageConstants.HELP;
    }

    return MessageFormatter.format(MessageConstants.DEFAULT_RESPONSE, {
      name: user.data.name || '',
    });
  }
}
