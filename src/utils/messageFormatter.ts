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
 * メッセージフォーマッタユーティリティクラス
 */
export class MessageFormatter {
  /**
   * プレースホルダーを置換してフォーマット
   * @param {string} template テンプレート文字列
   * @param {Record<string, any>} params パラメータ
   * @return {string} フォーマット済み文字列
   */
  public static format(
    template: string,
    params: Record<string, string>
  ): string {
    let result = template;

    Object.keys(params).forEach(key => {
      const placeholder = `{${key}}`;
      const value = String(params[key]);

      while (result.includes(placeholder)) {
        result = result.replace(placeholder, value);
      }
    });

    return result;
  }

  /**
   * 文字列を指定の長さに切り詰める
   * @param {string} text 入力文字列
   * @param {number} maxLength 最大長
   * @param {string} suffix 末尾に追加する文字列
   * @return {string} 切り詰めた文字列
   */
  public static truncate(
    text: string,
    maxLength: number,
    suffix = '...'
  ): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 現在時刻を指定フォーマットの文字列に変換
   * @param {string} format フォーマット
   * @return {string} フォーマット済み時刻文字列
   */
  public static formatTime(format = 'YYYY-MM-DD HH:mm:ss'): string {
    const now = new Date();

    const replacements: Record<string, string> = {
      YYYY: String(now.getFullYear()),
      MM: String(now.getMonth() + 1).padStart(2, '0'),
      DD: String(now.getDate()).padStart(2, '0'),
      HH: String(now.getHours()).padStart(2, '0'),
      mm: String(now.getMinutes()).padStart(2, '0'),
      ss: String(now.getSeconds()).padStart(2, '0'),
    };

    return MessageFormatter.format(format, replacements);
  }
}
