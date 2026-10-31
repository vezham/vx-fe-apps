import { detectOutfit } from './avatar-data'
import type { Outfit } from './avatar-data'

export type Persona =
  'helper' | 'coder' | 'writer' | 'planner' | 'tutor' | 'explorer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  persona: Persona
  outfit?: Outfit
  tasks?: { label: string; done: boolean }[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
}

export const EXAMPLES: {
  persona: Persona
  title: string
  description: string
  prompt: string
}[] = [
  {
    persona: 'coder',
    title: 'Build something',
    description: 'From a small idea to a first step',
    prompt: 'Help me build a personal portfolio with React.'
  },
  {
    persona: 'writer',
    title: 'Find the words',
    description: 'A fresh draft, a clearer thought',
    prompt: 'Write a warm introduction for my portfolio.'
  },
  {
    persona: 'planner',
    title: 'Make a plan',
    description: 'A little structure for a busy day',
    prompt: 'Help me plan a focused and balanced day.'
  },
  {
    persona: 'tutor',
    title: 'Learn something',
    description: 'Big ideas, simply explained',
    prompt: 'Explain how AI learns, like I am a beginner.'
  },
  {
    persona: 'explorer',
    title: 'Go somewhere',
    description: 'A small escape, a new perspective',
    prompt: 'Plan a relaxed weekend exploring Chennai.'
  }
]

export const detectPersona = (text: string): Persona => {
  if (
    /\b(code|react|build|bug|error|typescript|website|app|portfolio|function)\b/i.test(
      text
    )
  )
    return 'coder'
  if (
    /\b(write|draft|email|poem|story|words|introduction|rewrite)\b/i.test(text)
  )
    return 'writer'
  if (/\b(travel|trip|explor\w*|chennai|weekend|visit|holiday)\b/i.test(text))
    return 'explorer'
  if (/\b(plan|schedule|day|task|focus|todo|organize)\b/i.test(text))
    return 'planner'
  if (/\b(explain|learn|teach|understand|what is|how|ai|science)\b/i.test(text))
    return 'tutor'
  return 'helper'
}

export const createDemoReply = (
  prompt: string,
  persona: Persona
): Omit<Message, 'id' | 'role'> => {
  if (/வணக்கம்|\b(vanakkam|hello|hi|hey)\b/i.test(prompt))
    return {
      persona: 'helper',
      text: 'Vanakkam! வணக்கம்! I’m Tamizhi, your little thinking companion.\n\nPick an example, bring me an idea, or try a question. This is our local demo, so my replies are prepared while we shape the experience together.'
    }

  const replies: Record<Persona, Omit<Message, 'id' | 'role'>> = {
    helper: {
      persona,
      text: 'Let’s give that a little room to grow.\n\nI can help you **build**, **write**, **plan**, **learn**, or **explore**. Try one of the examples to see my look change with the task.\n\nFor this first-stage demo, I use prepared replies. Your messages stay in this browser, and no AI service is called.'
    },
    coder: {
      persona,
      text: 'A small, thoughtful portfolio is a lovely place to start. Let’s make the first version feel like you.\n\n1. **Introduce yourself.** One sentence about who you are and what you like making.\n2. **Show three projects.** Explain the problem, your contribution, and what you learned.\n3. **Make it easy to connect.** A simple contact link goes a long way.\n\nHere’s a tiny React starting point:\n\n```tsx\nconst Portfolio = () => (\n  <main>\n    <h1>Hello, I’m a maker.</h1>\n    <p>I turn curious ideas into useful things.</p>\n  </main>\n)\n```\n\nStart with the content. The details can grow from there.'
    },
    writer: {
      persona,
      text: 'Here’s a warm starting point you can make your own:\n\n> Hello, I’m glad you’re here. I’m a curious maker who enjoys turning thoughtful ideas into useful, welcoming experiences. This is a small collection of things I’ve built, lessons I’ve learned, and questions I’m still exploring.\n\n**Make it yours:** swap “curious maker” for what you do, and add one specific thing you love working on. A little personality will say more than a long list of skills.'
    },
    planner: {
      persona,
      text: 'Let’s build a day with a little focus and a little breathing room.\n\nChoose **one thing that would make today feel worthwhile**. Give it your freshest hour, and let the smaller tasks fit around it. Here’s a gentle starting plan:',
      tasks: [
        { label: 'Pick one meaningful priority for today', done: false },
        { label: 'Set aside 45 minutes of uninterrupted focus', done: false },
        { label: 'Take a proper break, away from the screen', done: false },
        { label: 'Group messages and small tasks into one block', done: false },
        { label: 'Write down tomorrow’s first small step', done: false }
      ]
    },
    tutor: {
      persona,
      text: 'Think of AI learning a little like learning to spot mangoes.\n\nYou show it lots of examples: ripe mangoes, unripe ones, and other fruit. At first, it guesses. After each guess, a training process adjusts the patterns it uses so its next guess is a little better.\n\n**The pattern is the lesson.** It doesn’t keep a little person inside who understands fruit. It learns numerical relationships that help it predict an answer.\n\nLanguage models do something similar with text: they learn patterns from examples and use the conversation to generate a likely continuation. That’s why they can be useful and still make mistakes.'
    },
    explorer: {
      persona,
      text: 'A slow weekend in Chennai sounds lovely. Here’s an unhurried starting point.\n\n**Saturday · Old streets, new discoveries**\n\nStart with a walk around Mylapore, pause for a filter coffee, and leave the afternoon open for a bookshop or somewhere you stumble upon.\n\n**Sunday · A little sea air**\n\nHead to Besant Nagar for a morning beach walk. Have a relaxed breakfast, then spend the afternoon with a book or a friend.\n\nKeep just one anchor activity each day. Check opening times and local conditions before you go; this sample itinerary isn’t live travel information.'
    }
  }
  const outfit = detectOutfit(prompt)
  const extraReplies: Partial<Record<Outfit, string>> = {
    cook: 'A quick dinner idea: **tomato and egg toast**.\n\n1. Soften a chopped tomato in a little oil.\n2. Beat two eggs, add them to the pan, and stir gently until set.\n3. Season and spoon over warm toast.\n\nAdd a handful of greens on the side. This is a prepared recipe example for the local demo.',
    music:
      'For a focused afternoon, try a gentle three-part listening session:\n\n1. **Settle in:** quiet piano or ambient instrumentals.\n2. **Find your rhythm:** steady instrumental beats without lyrics.\n3. **Wind down:** softer acoustic tracks for your last small task.\n\nThis demo suggests a listening plan; it doesn’t connect to a music service.',
    garden:
      'For a happier basil plant, start with the basics.\n\n- Give it plenty of bright light.\n- Check the soil before watering; water when the top feels dry.\n- Use a pot with drainage and avoid leaving it in standing water.\n- Pinch the growing tips above a pair of leaves to encourage branching.\n\nTell me what its leaves look like when we connect the full assistant.',
    bug: 'Let’s narrow down that error.\n\n1. **Read the first error line.** Note the value and operation that failed.\n2. **Follow the stack trace** to the first line in your own code.\n3. **Check the input** at that line. Is it missing, null, or the wrong type?\n4. Reduce it to the smallest example that still fails.\n\nThis is a prepared debugging walkthrough. The local demo doesn’t inspect or execute your code.',
    money:
      'Here’s a simple budget worksheet to start with:\n\n- List your regular income.\n- Subtract fixed essentials such as housing and utilities.\n- Set an amount aside for savings and unexpected expenses.\n- Give the remaining amount a clear purpose, leaving some flexibility.\n\nUse your own numbers to make it realistic. This local example doesn’t access accounts or calculate a personal budget.',
    designer:
      'Start with the job the interface needs to do.\n\n1. Sketch the main action and the content it needs.\n2. Use a clear type hierarchy and a small spacing scale.\n3. Choose one accent and let neutral surfaces do the rest.\n4. Check keyboard navigation, contrast, and a narrow screen.\n\nThis is a prepared design walkthrough for the demo.',
    tester:
      'A small test plan:\n\n1. Check the main successful path.\n2. Try missing and invalid input.\n3. Verify cancel, retry, and error recovery.\n4. Test with keyboard navigation and a small viewport.\n\nKeep assertions focused on what a user can observe. This demo doesn’t run tests.',
    guard:
      'Before a destructive change, make the action concrete:\n\n1. Identify the exact files or records affected.\n2. Preview the change and check for a recoverable backup.\n3. Confirm the intended result before proceeding.\n\nThis is a local demo; no files are changed.',
    captain:
      'A simple release check:\n\n1. Review the diff and confirm the intended scope.\n2. Run the relevant checks.\n3. Write a short release note describing the user-visible change.\n4. Ship through your normal review process.\n\nThis local demo doesn’t connect to Git or deploy anything.',
    coach:
      'Try a gentle screen-break routine:\n\n- Stand up and relax your shoulders.\n- Walk around for a couple of minutes.\n- Look away from the screen and breathe comfortably.\n- Return to one small, clear task.\n\nKeep movement comfortable for you. This is a prepared wellbeing example.',
    director:
      'A simple three-beat storyboard:\n\n1. **The setup:** show the person and the problem.\n2. **The turn:** show the idea that changes things.\n3. **The payoff:** show the result and one clear next step.\n\nKeep each beat to a single visual idea. This is a prepared example; the demo doesn’t generate video.',
    investigate:
      'Start with what you can observe:\n\n1. Write down what you expected and what actually happened.\n2. Find the earliest moment those paths diverged.\n3. Check one possible cause at a time.\n4. Keep the evidence that supports or rules out each cause.\n\nThis is a local investigation template, ready for a real question in the next stage.'
  }
  return extraReplies[outfit]
    ? { persona, outfit, text: extraReplies[outfit] ?? '' }
    : replies[persona]
}
