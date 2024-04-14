import { fetch, ResponseType, Body } from '@tauri-apps/api/http';

export function splitTextIntoPolls(text: string) {
  const questionLength = 300;
  const answerLength = 55;
  const maxAnswers = 10;
  const segmetLength = questionLength + answerLength * maxAnswers;

  // Split text into segments
  const segments = Array.from(
    { length: Math.ceil(text.length / segmetLength) },
    (_, i) => text.slice(i * segmetLength, (i + 1) * segmetLength)
  );

  // const segCount = segments.length

  let questions: string[] = [];
  let answers: string[][] = [];

  for (const segment of segments) {
    questions.push(segment.slice(0, questionLength));
    answers.push(
      Array.from(
        { length: Math.ceil((segment.length - questionLength) / answerLength) },
        (_, i) => segment.slice(questionLength + i * answerLength, questionLength + (i + 1) * answerLength)
      ).filter(a => a)
    );
  }

  answers = answers.map(a => a.length === 0 ? ['\u200b', '\u200b'] : a);

  return [questions, answers];
}

export function postPoll(pollBody: any, channelID: string, serverID: string, token: string) {
  fetch(`https://discord.com/api/v9/channels/${channelID}/messages`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; rv:124.0) Gecko/20100101 Firefox/124.0',
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/json',
      Authorization: token,
      'X-Super-Properties':
        'ewogICJvcyI6ICJXaW5kb3dzIiwKICAiY2xpZW50X2J1aWxkX251bWJlciI6IDI4MzY0Ngp9',
      Referer: `https://discord.com/channels/${serverID}/${channelID}`,
      Origin: 'https://discord.com',
    },
    body: Body.json(pollBody),
    responseType: ResponseType.JSON,
    method: 'POST',
  })
}