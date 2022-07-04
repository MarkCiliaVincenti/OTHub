import { config } from 'dotenv'
const { ACCESS_TOKEN } = process.env.ACCESS_TOKEN || config.parsed()
console.log(ACCESS_TOKEN)

export const get = async (args) => await proxyRequest(args)
export const post = async (args) => await proxyRequest(args)
export const del = async (args) => await proxyRequest(args)

const proxyRequest = async ({ url, request }) => {
  try {
    const { method } = request
    const endpoint = url.href.split('/api/')[1]
    const APIrequest = await fetch(`https://v5api.othub.info/api/${endpoint}`, { 
      method,
      headers: { 
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        ...(method === 'POST') && { 'Content-Type': 'application/json' },
      },
    })
    const response = await APIrequest.json()
    const { headers } = APIrequest
    const totalCount = headers.get('x-total-count')
    return {
      status: 200,
      body: { 
        ...(response) && { data: response },
        ...(totalCount) && { totalCount }
      }
    }
  }
  catch (e) {
    console.log(e)
  }
}
