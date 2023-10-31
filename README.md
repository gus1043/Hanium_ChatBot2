# Hanium_ChatBot2

## google-translate API
<p>
  https://cloud.google.com/translate/docs/reference/rest/v3/projects.locations/translateText
</p>

## Test 결과 
<img width="490" alt="image" src="https://github.com/gus1043/Hanium_ChatBot2/assets/80878955/37e07828-9bc2-4f23-a164-b85ba13f9f2a">

## 실제 구현
POST https://www.googleapis.com/language/translate/v2?

**설정방법**


[Params]
|key |Value|
|:---:|:---:|
|key|myapikey|



[Headers]
|key |Value|
|:---:|:---:|
|Content-Type   |application/json; charset=utf-8|



[Body]</br>
|raw - Json|
|:------:|
|{
"q" :"안녕녕",
"source": "ko",
"target" : "en",
"format":"text"
} |


