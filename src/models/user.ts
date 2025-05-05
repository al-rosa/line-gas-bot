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
import { StatusConstants } from '../constants/statusConstants';
import { SpreadsheetService } from '../services/spreadsheetService';
import { Logger } from '../utils/logger';

/**
 * ユーザー行データの型定義
 */
export type UserRow = [
  string, // userId
  string | null, // displayName
  string, // state
  string, // data (JSON文字列)
  Date | string, // createdAt
  Date | string | null, // updatedAt
];

/**
 * ユーザーデータインターフェース
 */
export interface UserData {
  name?: string;
  age?: number;
  email?: string;
  [key: string]: unknown; // anyの代わりにunknownを使用
}

/**
 * ユーザーモデルクラス
 */
export class User {
  public userId: string;
  public displayName: string | null;
  public state: string;
  public data: UserData;
  public createdAt: Date;
  public updatedAt: Date | null;

  /**
   * コンストラクタ
   * @param {string} userId LINEユーザーID
   * @param {string} displayName 表示名
   */
  constructor(userId: string, displayName: string | null = null) {
    this.userId = userId;
    this.displayName = displayName;
    this.createdAt = new Date();
    this.updatedAt = null;
    this.state = StatusConstants.INITIAL;
    this.data = {};
  }

  /**
   * ユーザー情報をスプレッドシートに保存
   * @return {boolean} 保存成功かどうか
   */
  public save(): boolean {
    try {
      const ss = SpreadsheetService.getInstance();
      const userData: UserRow = [
        this.userId,
        this.displayName,
        this.state,
        JSON.stringify(this.data),
        this.createdAt,
        this.updatedAt || null,
      ];

      ss.saveUserData(userData);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        Logger.getInstance().error(`User save error: ${error.message}`);
      } else {
        Logger.getInstance().error(`User save error: Unknown error`);
      }
      return false;
    }
  }

  /**
   * ユーザーIDでユーザーを検索
   * @param {string} userId LINEユーザーID
   * @return {User|null} ユーザーインスタンスまたはnull
   */
  public static findByUserId(userId: string): User | null {
    try {
      const ss = SpreadsheetService.getInstance();
      const userData = ss.getUserDataByUserId(userId);

      if (!userData) return null;

      const user = new User(userData[0], userData[1]);
      user.state = userData[2];
      user.data = JSON.parse(userData[3] || '{}');

      // 日付の処理
      user.createdAt =
        userData[4] instanceof Date
          ? userData[4]
          : new Date(String(userData[4]));

      // updatedAtが存在する場合
      if (userData[5]) {
        user.updatedAt =
          userData[5] instanceof Date
            ? userData[5]
            : new Date(String(userData[5]));
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        Logger.getInstance().error(`Find user error: ${error.message}`);
      } else {
        Logger.getInstance().error(`Find user error: Unknown error`);
      }
      return null;
    }
  }

  /**
   * ユーザー状態を更新
   * @param {string} newState 新しい状態
   * @return {boolean} 更新成功かどうか
   */
  public updateState(newState: string): boolean {
    this.state = newState;
    this.updatedAt = new Date();
    return this.save();
  }

  /**
   * ユーザーデータを更新
   * @param {UserData} newData 新しいデータ
   * @return {boolean} 更新成功かどうか
   */
  public updateData(newData: UserData): boolean {
    this.data = { ...this.data, ...newData };
    this.updatedAt = new Date();
    return this.save();
  }
}
