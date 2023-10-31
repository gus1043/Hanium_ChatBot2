# Hanium_ChatBot2

## google-translate API
<p>
  https://cloud.google.com/translate/docs/reference/rest/v3/projects.locations/translateText
</p>

## Test 결과 
![image](https://github.com/gus1043/Hanium_ChatBot2/assets/80878955/a72c4fad-e64d-425d-9533-d79a7b925cc5)


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
|{"q" :"안녕녕", "source": "ko", "target" : "en", "format":"text" } |


