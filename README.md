# Crownstone Lambda

This repository contains the Lambda function used to handle incomming requests from Alexa & Google Assistant. 

## Requirements
- AWS account
- Google Account
- Google service key
- API Gateway key
- Event server URL
- Event server JWT


## How it works
At the core of this application is a single entrypoint which handles incomming requests from Google and Amazon. The entrypoint can be found in the file `src/index.ts` and is called `handler`. This function calls one of the handlers defined in `src/google/index.ts` and `src/alexa/index.ts`.




### Google Actions 
Google lets users control their connected devices through the Google Home app and the Google Assistant. To connect the crownstone to Google Assistant, you need to build a smart home Action. 

#### Home graph



## Setup


### Project structure


## Deploying


