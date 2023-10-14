require('dotenv').config() // Load environment variables from .env file

var db = require('../lib/db.js');

const AIR_DEVICE_NUM = process.env.AIR_DEVICE_NUM
const BULB_DEVICE_NUM = process.env.BULB_DEVICE_NUM
const SMARTTHINGS_KEY = process.env.SMARTTHINGS_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const axios = require('axios')

const apiRouter = require('express').Router()

apiRouter.post('/controlbulb-on', async function (req, res) {
  // 전등, 전구, 불빛 켜줘 등 텍스트가 들어오면 실행
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
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    const url = `https://api.smartthings.com/v1/devices/${BULB_DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'colorControl',
          command: 'setHue',
          arguments: [360], // 색조 값 (0부터 360까지, 0이 빨간색)
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
              text: '전등의 색이 바뀌었습니다.',
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

apiRouter.post('/controlair-on', async function (req, res) {
  
  db.query('update count set airCnt = airCnt + 1 where cntIdx = 1', function(err, results, fields){
    if(err) throw err;
    console.log(results);
  })
  
  try {
    const { userRequest } = req.body

    if (!userRequest || !userRequest.utterance) {
      // userRequest나 utterance가 없는 경우 에러 처리
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
            simpleText: {
              text: '공기 청정기의 전원이 켜졌습니다.',
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
            simpleText: {
              text: '공기 청정기의 전원이 꺼졌습니다.',
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

apiRouter.post('/controlmonitor', function (req, res) {
  // 채널, 소리, TV, 모니터 등 텍스트가 들어오면 실행
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  const responseBody = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: 'monitor: ' + utterance,
          },
        },
      ],
    },
  }

  res.status(200).send(responseBody)
})

// '/chatgpt' 엔드포인트에 대한 POST 요청 핸들러
apiRouter.post('/chatgpt', async function (req, res) {
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    // OpenAI API에 메시지 전달하고 응답 받기
    const resGPT = await getResponse(utterance)

    // ChatGPT 응답을 카카오톡 플러스친구 API에 맞는 형식으로 변환
    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: resGPT,
            },
          },
        ],
      },
    }

    // 변환된 응답 보내기
    res.status(200).send(responseBody)
  } catch (error) {
    // 오류 정보를 더 자세하게 출력하기
    console.error('Error calling OpenAI API:')
    console.error('Error message:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    res.status(500).send('Error generating response')
  }
})

// OpenAI API로 메시지를 보내고 응답을 받는 함수
async function getResponse(msg) {
  const data = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: msg }],
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
        timeout: 200000,
      },
    )

    const result1 = response.data.choices[0].message.content
    return result1
  } catch (e) {
    console.error('OpenAI API 오류:', e.response?.data?.error || e.message || e)
    throw e
  }
}

module.exports = apiRouter
