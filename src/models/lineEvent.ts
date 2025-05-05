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
 * LINEのソース情報インターフェース
 */
export interface LineSource {
  type: 'user' | 'group' | 'room';
  userId?: string;
  groupId?: string;
  roomId?: string;
}

/**
 * LINEメッセージインターフェース
 */
export interface LineMessage {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
  text?: string;
  contentProvider?: {
    type: 'line' | 'external';
    originalContentUrl?: string;
    previewImageUrl?: string;
  };
}

/**
 * LINEポストバックインターフェース
 */
export interface LinePostback {
  data: string;
  params?: Record<string, string>;
}

/**
 * LINEイベントインターフェース
 */
export interface LineEvent {
  type:
    | 'message'
    | 'follow'
    | 'unfollow'
    | 'join'
    | 'leave'
    | 'memberJoined'
    | 'memberLeft'
    | 'postback'
    | 'beacon'
    | 'accountLink'
    | 'things';
  replyToken?: string;
  source: LineSource;
  timestamp: number;
  mode: 'active' | 'standby';
  message?: LineMessage;
  postback?: LinePostback;
  webhookEventId?: string;
  deliveryContext?: {
    isRedelivery: boolean;
  };
}
