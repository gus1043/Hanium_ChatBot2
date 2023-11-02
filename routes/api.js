require('dotenv').config() // Load environment variables from .env file

var db = require('../lib/db.js')

const AIR_DEVICE_NUM = process.env.AIR_DEVICE_NUM
const BULB_DEVICE_NUM = process.env.BULB_DEVICE_NUM
const SMARTTHINGS_KEY = process.env.SMARTTHINGS_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MON_DEVICE_NUM = process.env.MON_DEVICE_NUM
const NLP_KEY = process.env.NLP_KEY

const language = require('@google-cloud/language').v2
const client = new language.LanguageServiceClient()

const axios = require('axios')

const apiRouter = require('express').Router()

apiRouter.post('/controlbulb-on', async function (req, res) {
  // 전등, 전구, 불빛 켜줘 등 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, lightCnt, lightDate) values(CURRENT_DATE, lightCnt+1, now()) on duplicate key update lightCnt = lightCnt+1, lightDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    const url = `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'on',
          arguments: [],
          name: 'on',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '전등의 전원이 켜졌습니다.',
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlbulb-off', async function (req, res) {
  // 전등, 전구, 불빛 꺼줘 등 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, lightCnt, lightDate) values(CURRENT_DATE, lightCnt+1, now()) on duplicate key update lightCnt = lightCnt+1, lightDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    const url = `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'off',
          arguments: [],
          name: 'off',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '전등의 전원이 꺼졌습니다.',
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlbulb-color', async function (req, res) {
  // 전등 제어 + 기분 관련 텍스트 들어오면 실행

  db.query(
    'insert into count2 (date, lightCnt, lightDate) values(CURRENT_DATE, lightCnt+1, now()) on duplicate key update lightCnt = lightCnt+1, lightDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    const resText = await translateText(utterance)
    const resNLP = await getNLP(resText)
    const url = `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/commands`

    let hue
    let outputs

    if (resNLP <= -0.3) {
      // When result1 is less than or equal to -0.2
      hue = 115
      outputs = [
        {
          basicCard: {
            title: '조명을 연한 노란색으로 설정했어요.',
            description:
              '힘들거나 기분이 좋지 않은 때는, 주로 따뜻하고 밝은 색상을 선택하는 것이 도움이 될 수 있습니다. 밝고 활기찬 노란색은 기분을 상쾌하게 하고, 당신에게 긍정적인 에너지를 불어넣어 줄 거예요. 아래는 기분이 우울할 때 도움을 줄 수 있는 정보를 담은 링크입니다.',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/6mSJ4cY/creative-portrait-of-man-with-curtains-and-shadows-from-window.jpg',
            },
            buttons: [
              {
                action: 'webLink',
                label: '우울할 때 도움되는 음식',
                webLinkUrl: 'https://brunch.co.kr/@wikitree/159',
              },
            ],
          },
        },
      ]
    } else if (resNLP >= -0.2 && resNLP <= 0.3) {
      // When result1 is between -0.1 and 0.1
      hue = 150
      outputs = [
        {
          basicCard: {
            title: '조명을 기본 흰색으로 설정했어요.',
            description:
              '말씀해 주셔서 감사합니다. 문장을 분석한 결과 기분이 보통이신 것 같습니다. 제가 올바르게 분석했나요? 차분하고 깔끔한 느낌을 주는 흰색으로 조명을 바꿔 드릴게요.',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/MMFxqtZ/handsome-modern-guy-feeling-confident-showing-ok-sign-and-winking-at-you-assure-everything-okay-stan.jpg',
            },
          },
        },
      ]
    } else {
      hue = 80
      outputs = [
        {
          basicCard: {
            title: '조명을 분홍색으로 설정했어요.',
            description:
              '오늘은 기분이 아주 좋아 보이네요! 행복과 포근함을 상징하는 분홍색으로 조명 색을 바꿔 드렸어요. 항상 좋은 하루 보내시길 바랍니다!',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/fn6Zqxh/portrait-of-sincere-brunette-asian-female-model-rubs-palms-and-smiles-broadly-expresses-happiness-fe.jpg',
            },
          },
        },
      ]
    }

    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'colorControl',
          command: 'setColor',
          arguments: [
            {
              hue: hue, // Default
              saturation: 50,
            },
          ],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs,
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

async function getNLP(msg) {
  const data = {
    document: {
      type: 'PLAIN_TEXT',
      content: msg,
    },
  }

  try {
    const response = await axios.post(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${NLP_KEY}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: NLP_KEY,
        },
      },
    )

    const result1 =
      response.data.sentences.reduce(
        (sum, sentence) => sum + sentence.sentiment.score,
        0,
      ) / response.data.sentences.length

    return result1
  } catch (e) {
    console.error('NLP API 오류:', e.response?.data?.error || e.message || e)
    throw e
  }
}

apiRouter.post('/controlair-on', async function (req, res) {
  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  try {
    const { userRequest } = req.body

    if (!userRequest || !userRequest.utterance) {
      /// userRequest나 utterance가 없는 경우 에러 처리
      throw new Error('userRequest나 utterance가 없습니다.')
    }

    const utterance = userRequest.utterance

    // 이하 코드는 유효한 utterance가 있는 경우에만 실행됩니다.

    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'on',
          arguments: [],
          name: 'on',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: '발표장에 있는 공기청정기의 전원이 켜졌어요.',
              thumbnail: {
                imageUrl: 'https://i.ibb.co/PW82Bdh/air-on.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-off', async function (req, res) {
  // 공기청정기 꺼줘 관련 텍스트가 들어오면 실행
  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  const { userRequest } = req.body
  const utterance = userRequest.utterance

  console.log(AIR_DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'off',
          arguments: [],
          name: 'off',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: '발표장에 있는 공기청정기의 전원이 꺼졌어요.',
              thumbnail: {
                imageUrl: 'https://i.ibb.co/qknd4r0/air-off.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-low', async function (req, res) {
  // 공기청정기 세기 약하게, 미풍 관련 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  console.log(AIR_DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          arguments: ['low'],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: '발표장에 있는 공기청정기의 세기가 미풍으로 변경되었어요.',
              description: '약한 바람으로 조용하게 공기를 정화할게요.',
              thumbnail: {
                imageUrl:
                  ' https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/4.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-mid', async function (req, res) {
  // 공기청정기 세기 중간, 약풍 관련 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  console.log(AIR_DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          arguments: ['medium'],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title:
                '발표장에 있는 공기청정기의 전원의 세기가 약풍으로 바뀌었어요.',
              description: '중간 바람을 활용해 효율적으로 공기를 정화할게요.',
              thumbnail: {
                imageUrl:
                  'https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/1.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-high', async function (req, res) {
  // 공기청정기 세기 강풍, 세게 관련 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  console.log(AIR_DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          arguments: ['high'],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title:
                '발표장에 있는 공기청정기의 전원의 세기가 강풍으로 바뀌었어요.',
              description: '입체 바람으로 강력하게 공기를 정화할게요.',
              thumbnail: {
                imageUrl:
                  'https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/3.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-sleep', async function (req, res) {
  // 공기청정기 세기 수면풍, 취침 모드 관련 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, airCnt, airDate) values(CURRENT_DATE, airCnt+1, now()) on duplicate key update airCnt = airCnt+1, airDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  console.log(AIR_DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'airConditionerFanMode',
          command: 'setFanMode',
          arguments: ['sleep'],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title:
                '발표장에 있는 공기청정기의 전원의 세기가 수면풍으로 바뀌었어요.',
              description: '조용하고 편안하게 공기를 정화할게요.',
              thumbnail: {
                imageUrl:
                  'https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/2.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlmonitor-on', async function (req, res) {
  // 채널, 소리, TV, 모니터 등 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, monitorCnt, monitorDate) values(CURRENT_DATE, monitorCnt+1, now()) on duplicate key update monitorCnt = monitorCnt+1, monitorDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  try {
    const url = `https://api.smartthings.com/v1/devices/${MON_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'on',
          arguments: [],
          name: 'on',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: '발표장에 있는 모니터의 전원이 켜졌어요.',
              thumbnail: {
                imageUrl:
                  'https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/6.jpg',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlmonitor-off', async function (req, res) {
  // 채널, 소리, TV, 모니터 등 텍스트가 들어오면 실행

  db.query(
    'insert into count2 (date, monitorCnt, monitorDate) values(CURRENT_DATE, monitorCnt+1, now()) on duplicate key update monitorCnt = monitorCnt+1, monitorDate = CURRENT_TIMESTAMP',
    function (err, results, fields) {
      if (err) throw err
      console.log(results)
    },
  )

  try {
    const url = `https://api.smartthings.com/v1/devices/${MON_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'off',
          arguments: [],
          name: 'off',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: '발표장에 있는 모니터의 전원이 꺼졌어요.',
              thumbnail: {
                imageUrl:
                  'https://imgae-bucket.s3.ap-northeast-2.amazonaws.com/monit.png',
              },
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

// '/chatgpt' 엔드포인트에 대한 POST 요청 핸들러
apiRouter.post('/chatgpt', async function (req, res) {
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  function containsKeywords(utterance) {
    const keywords = [
      '조명',
      '조명 색',
      '전등',
      '전등 색',
      '불빛',
      '불빛 색',
      '분위기',
      '전등 색 바꿔',
      '전구 색 바꿔',
      '조명 바꿔 줘',
      '분위기 바꿔',
    ]

    return keywords.some((keyword) => utterance.includes(keyword))
  }

  if (containsKeywords(utterance)) {
    // 전등 제어 + 기분 관련 텍스트 들어오면 실행

    db.query(
      'insert into count2 (date, lightCnt, lightDate) values(CURRENT_DATE, lightCnt+1, now()) on duplicate key update lightCnt = lightCnt+1, lightDate = CURRENT_TIMESTAMP',
      function (err, results, fields) {
        if (err) throw err
        console.log(results)
      },
    )

    const resText = await translateText(utterance)
    console.log('resText:', resText)
    const resNLP = await getNLP(resText)
    console.log('resNLP:', resNLP)

    const url = `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/commands`

    let hue
    let outputs

    console.log(resNLP)
    if (resNLP <= -0.3) {
      // When result1 is less than or equal to -0.2
      hue = 115
      outputs = [
        {
          basicCard: {
            title: '조명을 연한 노란색으로 설정했어요.',
            description:
              '힘들거나 기분이 좋지 않은 때는, 주로 따뜻하고 밝은 색상을 선택하는 것이 도움이 될 수 있습니다. 밝고 활기찬 노란색은 기분을 상쾌하게 하고, 당신에게 긍정적인 에너지를 불어넣어 줄 거예요. 아래는 기분이 우울할 때 도움을 줄 수 있는 정보를 담은 링크입니다.',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/6mSJ4cY/creative-portrait-of-man-with-curtains-and-shadows-from-window.jpg',
            },
            buttons: [
              {
                action: 'webLink',
                label: '우울할 때 도움되는 음식',
                webLinkUrl: 'https://brunch.co.kr/@wikitree/159',
              },
            ],
          },
        },
      ]
    } else if (resNLP >= -0.2 && resNLP <= 0.3) {
      // When result1 is between -0.1 and 0.1
      hue = 150
      outputs = [
        {
          basicCard: {
            title: '조명을 기본 흰색으로 설정했어요.',
            description:
              '말씀해 주셔서 감사합니다. 문장을 분석한 결과 기분이 보통이신 것 같습니다. 제가 올바르게 분석했나요? 차분하고 깔끔한 느낌을 주는 흰색으로 조명을 바꿔 드릴게요.',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/MMFxqtZ/handsome-modern-guy-feeling-confident-showing-ok-sign-and-winking-at-you-assure-everything-okay-stan.jpg',
            },
          },
        },
      ]
    } else {
      hue = 80
      outputs = [
        {
          basicCard: {
            title: '조명을 분홍색으로 설정했어요.',
            description:
              '오늘은 기분이 아주 좋아 보이네요! 행복과 포근함을 상징하는 분홍색으로 조명 색을 바꿔 드렸어요. 항상 좋은 하루 보내시길 바랍니다!',
            thumbnail: {
              imageUrl:
                'https://i.ibb.co/fn6Zqxh/portrait-of-sincere-brunette-asian-female-model-rubs-palms-and-smiles-broadly-expresses-happiness-fe.jpg',
            },
          },
        },
      ]
    }

    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'colorControl',
          command: 'setColor',
          arguments: [
            {
              hue: hue, // Default
              saturation: 50,
            },
          ],
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SMARTTHINGS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs,
      },
    }

    res.status(200).send(responseBody)

    //구글 translate API
    async function translateText(msg) {
      const data = {
        q: msg,
        source: 'ko',
        target: 'en',
        format: 'text',
      }

      try {
        const response = await axios.post(
          `https://www.googleapis.com/language/translate/v2?key=${NLP_KEY}`,
          data,
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            params: {
              key: NLP_KEY,
            },
          },
        )
        const translatedText = response.data.data.translations[0].translatedText
        console.log(translatedText)
        return translatedText
      } catch (e) {
        console.error(
          'Google translate API 오류:',
          e.response?.data?.error || e.message || e,
        )
        throw e
      }
    }

    // 구글 감정 분석 API로 메시지를 보내고 응답을 받는 함수
    async function getNLP(msg) {
      const data = {
        document: {
          type: 'PLAIN_TEXT',
          content: msg,
        },
      }

      try {
        const response = await axios.post(
          `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${NLP_KEY}`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              key: NLP_KEY,
            },
          },
        )

        const weightedSum = response.data.sentences.reduce(
          (sum, sentence, index) => {
            const weight = index === 0 ? 1.4 : 1 // 첫 번째 문장에 1.4 가중치, 나머지에는 1 가중치
            return sum + sentence.sentiment.score * weight
          },
          0,
        )

        result1 = weightedSum / response.data.sentences.length
        console.log(result1)
        return result1
      } catch (e) {
        console.error(
          'NLP API 오류:',
          e.response?.data?.error || e.message || e,
        )
        throw e
      }
    }
  } else {
    try {
      const user_request = req.body.userRequest || {}
      const callback_url = user_request.callbackUrl
      const request_data = req.body
      const call_back = await axios.post(request_data.callback_url, {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: request_data.result,
              },
            },
          ],
        },
      })
      console.log(call_back.status, call_back.data)
      res.send('OK')

      app.post(callback_url, async (req, res) => {
        console.log(userRequest)
        console.log(callback_url)
        const data = {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: utterance }],
        }
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            data,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              timeout: 2000,
            },
          )
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log('Timeout occurs')
          }
        }
        res.json({
          version: '2.0',
          useCallback: true,
        })
      })
    } catch (error) {
      console.error('Error calling OpenAI API:')
      console.error('Error message:', error.message)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      res.status(500).send('Error generating response')
    }
  }
})

// // API 엔드포인트 경로
// apiRouter.get('/get-switch-values', async (req, res) => {
//   try {
//     const urls = [
//       `https://api.smartthings.com/v1/devices/${MON_DEVICE_NUM}/components/main/capabilities/switch/status`,
//       `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/components/main/capabilities/switch/status`,
//       `https://api.smartthings.com/v1/devices/${AIR_DEVICE_NUM}/components/main/capabilities/switch/status`,
//     ]

//     const switchValues = []

//     for (const url of urls) {
//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${SMARTTHINGS_KEY}`, // SmartThings API Key를 여기에 입력하세요.
//         },
//       })

//       if (response.ok) {
//         const data = await response.json()
//         const value = data.switch.value
//         switchValues.push(value)
//       }
//     }

//     const responseBody = {
//       version: '2.0',
//       template: {
//         outputs: [
//           {
//             simpleText: {
//               text: `실시간 장치 작동 현황입니다. 모니터의 상태는 ${switchValues[0]}, 전등의 상태는 ${switchValues[1]}, 공기청정기의 상태는 ${switchValues[2]}입니다. 오늘도 즐거운 하루 보내세요.`,
//             },
//           },
//         ],
//       },
//     }

//     res.status(200).send(responseBody)
//   } catch (error) {
//     console.error('오류가 발생했습니다.', error)
//     res.status(500).send('오류가 발생했습니다.')
//   }
// })

module.exports = apiRouter
