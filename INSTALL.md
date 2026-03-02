# Local setup
- npx create-expo-app massCodeMobile --template blank
- npx expo install expo-document-picker expo-file-system react-native-syntax-highlighter react-native-safe-area-context
- set "expo": "^54.0.4" to match with mobile phone "expo go" version
- npx expo install --fix
- rm -rf .expo
- npx expo start --clear

## Once ready to install on phone
- npm install -g eas-cli
- login to expo account
    - eas login
    - eas build:configure
- update `eas.json` preview section to following
```
"preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk" 
      }
    },
```
- eas build -p android --profile preview

## Setup Over-the-Air (OTA) Updates
- npx expo install expo-updates
- eas update:configure
- Use following command to push an update
- eas update --branch preview --message "Enhancing search for content"