import { OpenposMessage } from '../messages/message';

export interface AudioPreloadMessage extends OpenposMessage {
    contentUrls: string[];
}
