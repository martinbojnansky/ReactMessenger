import * as actions from './Actions';
import { getStore } from '../models/Store';
import { sendMessage } from '../api/Messages';
import { NewMessageDTO } from '../models/Message';
import { onShowError } from './Error';
import { onGetMessages } from './Conversation';

export function onMessageChanged(message: string): actions.MessageChangedAction {
    return {
        type: actions.TypeKeys.MESSAGE_CHANGED,
        message: message
    };
}

export function onSendMessageStarted(): actions.SendMessageStartedAction {
    return {
        type: actions.TypeKeys.SEND_MESSAGE_STARTED
    };
}

export function onSendMessageFailed(): actions.SendMessageFailedAction {
    return {
        type: actions.TypeKeys.SEND_MESSAGE_FAILED
    };
}

export function onSendMessageCompleted(message: string): actions.SendMessageCompletedAction {
    return {
        type: actions.TypeKeys.SEND_MESSAGE_COMPLETED,
        message: message
    };
}

export function onSendMessage(message: string): actions.SendMessageAction {
    getStore().dispatch(onSendMessageStarted());

    let channel = getStore().getState().conversation.channel;
    let channelId = channel ? channel.id : '';
    let newMessage: NewMessageDTO = {
        value: message, 
        customData: JSON.stringify({ upVotes: [], downVotes: [] })
    };

    sendMessage(channelId, newMessage)
    .then(() => {
        getStore().dispatch(onSendMessageCompleted(message));
        getStore().dispatch(onGetMessages(channelId));
    })
    .catch((error: Error) => {
        getStore().dispatch(onSendMessageFailed());
        getStore().dispatch(
            onShowError('Ooops!', `Unable to send message. Check your network connection and try again.`));
    });
    
    return {
        type: actions.TypeKeys.SEND_MESSAGE,
    };
}