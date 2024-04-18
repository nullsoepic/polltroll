import { postPoll, splitTextIntoPolls } from "./polls";
import { confirm } from "@tauri-apps/api/dialog";

async function submit() {
  let textinput = document.querySelector('#textinput') as HTMLTextAreaElement;
  let cooldown = document.querySelector('#cooldown') as HTMLInputElement;
  let token = document.querySelector('#token') as HTMLInputElement;
  let channelid = document.querySelector('#channelid') as HTMLInputElement;
  let serverid = document.querySelector('#serverid') as HTMLInputElement;

  const missing: string[] = [];
  if (!textinput.value) missing.push('Text to send');
  if (!cooldown.value) missing.push('Post cooldown');
  if (!token.value) missing.push('Discord token');
  if (!channelid.value) missing.push('Channel ID');
  if (!serverid.value) missing.push('Server ID');

  if (missing.length > 0) {
    return alert(`Missing field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
  }

  const [questions, answerGroups] = splitTextIntoPolls(textinput.value)

  for (let i = 0; i < questions.length; i++) {
    const pollBodyBase = {
      mobile_network_type: 'unknown',
      content: '',
      nonce: Date.now(),
      tts: false,
      flags: 0,
    };

    const pollBody = {
      ...pollBodyBase,
      poll: {
        question: {
          text: questions[i],
        },//@ts-ignore
        answers: answerGroups[i].map((a) => ({
          poll_media: {
            text: a,
          },
        })),
        allow_multiselect: true,
        duration: 1,
        layout_type: 1,
      },
    };

    while (!await postPoll(pollBody, channelid.value, serverid.value, token.value)) {
      if (!await confirm('Failed to create a poll!\nTry again or cancel'))
        break
    }

    await new Promise(resolve => setTimeout(resolve, parseInt(cooldown.value)));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#clear")?.addEventListener("click", () => {
    const textinput = document.querySelector('#textinput') as HTMLTextAreaElement;
    textinput.value = '';
  });

  document.querySelector('#submit')?.addEventListener("click", () => {
    submit()
  })
});

