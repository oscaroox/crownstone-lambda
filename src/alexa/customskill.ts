import { RequestHandler, getRequestType, getIntentName, ErrorHandler, SkillBuilders } from 'ask-sdk-core';

const WhyHandler: RequestHandler = {
    canHandle(input) {
        return (
            getRequestType(input.requestEnvelope) === 'IntentRequest' &&
            getIntentName(input.requestEnvelope) === 'retro_why'
        );
    },
    handle(input) {
        return input.responseBuilder.speak('I do not know why').getResponse();
    },
};

const FallbackIntentHandler: RequestHandler = {
    canHandle(handlerInput) {
        return (
            getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
        );
    },
    handle(handlerInput) {
        const speakOutput = 'fallback handler';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};

const LaunchRequestHandler: RequestHandler = {
    canHandle(handlerInput) {
        return getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'welcome to crownstone retrospective';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};

const HelpIntentHandler: RequestHandler = {
    canHandle(handlerInput) {
        return (
            getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
        );
    },
    handle(handlerInput) {
        const speakOutput = 'i will try to help you';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    },
};

const SessionEndedRequestHandler: RequestHandler = {
    canHandle(handlerInput) {
        return getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    },
};

const ErrorHandler: ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak("Sorry, I can't understand the command. Please say again.")
            .reprompt("Sorry, I can't understand the command. Please say again.")
            .getResponse();
    },
};

/**
 * Add additional request handlers here
 */
export const customSkill = SkillBuilders.custom()
    .addRequestHandlers(
        WhyHandler,
        LaunchRequestHandler,
        HelpIntentHandler,
        SessionEndedRequestHandler,
        FallbackIntentHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .create();
