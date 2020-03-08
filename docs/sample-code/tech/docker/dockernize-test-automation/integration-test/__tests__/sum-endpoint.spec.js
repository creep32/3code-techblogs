const axios = require('axios')
const { spawn } = require('child_process')

// Unrecommended setup and teardown
let proc;
beforeAll(async () => {
  proc = spawn("node", [`${process.cwd()}/app.js`])
  await new Promise((resolve) => {setTimeout(() => {resolve()}, 2000)})
});

afterAll(() => {
  proc.kill('SIGTERM')
});

describe('sum endpoint', () => {
  test('simple calculation', async () => {
    const [a, b] = [1, 2]
    const ret = await axios.post('http://localhost:3000/sum', {a, b})

    expect(ret.data).toEqual({result: a +b})
  })
})
