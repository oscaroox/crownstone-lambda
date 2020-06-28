import { LocaleService } from './../../helpers/LocationService';
import {
    SignIn,
    DialogflowConversation,
    Parameters,
    Contexts,
    Argument,
    GoogleCloudDialogflowV2WebhookRequest,
} from 'actions-on-google';
import { getApi, Api } from '../../utils/api';
import { createLogger } from '../../utils/logger';

const log = createLogger('google/util/authorize');

type DialogFlowConv = DialogflowConversation<any, any, Contexts>;

type Conversation = DialogFlowConv & { api: Api; i18n: LocaleService };

export const authorize = (
    cb: (conv: Conversation, params: Parameters, args: Argument) => Promise<any> | any,
): ((conv: DialogFlowConv, params: Parameters, args: Argument) => void) => {
    return async (conv, params, args) => {
        log.info(`Calling ${conv.intent} with params ${JSON.stringify(params)}`);
        if (!conv.user.access.token) {
            log.info('User not authenticad');
            return conv.ask(new SignIn('To start using crownstone dialog signin'));
        }
        log.info('User authenticated');
        const newConf = conv as Conversation;
        newConf.api = getApi(conv.user.access.token);
        newConf.i18n = new LocaleService();
        // set user language code
        const body = conv.body as GoogleCloudDialogflowV2WebhookRequest;
        await newConf.i18n.setLocale(body.queryResult?.languageCode);

        return await cb(newConf, params, args);
    };
};
