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
 * メッセージに関する定数
 */
export const MessageConstants = {
  // システムメッセージ
  WELCOME: 'こんにちは！「登録」と入力すると登録を開始できます。',
  ERROR: 'エラーが発生しました。',
  HELP: 'ヘルプメッセージです。',
  UNKNOWN_ACTION: '不明なアクションです。',
  ANALYSIS_CONTINUED: '\n\n(前のメッセージの続き)',
  DEFAULT_RESPONSE: 'デフォルトの応答です。',

  // ユーザー登録メッセージ
  REGISTRATION_START: '登録を開始します。名前を教えてください。',
  INVALID_NAME: '名前は2文字以上で入力してください。',
  NAME_CONFIRMED: '名前「{name}」を確認しました。年齢を教えてください。',
  INVALID_AGE: '年齢は1から120の範囲で入力してください。',
  REGISTRATION_COMPLETED: '登録が完了しました！\n\n名前: {name}\n年齢: {age}',
};
