import type { ApplicationAction } from './application'
import { formatDateTimeLong } from './time'
import type { Interview, Message } from './types'

// Templated candidate messages. Delivery is simulated: a sent message becomes a
// timeline event that both the manager and the candidate's status page read.

export type MessageKind = Exclude<ApplicationAction, 'withdraw'> | 'received' | 'position_filled'

export interface MessageContext {
  candidateName: string
  positionTitle: string
  nurseryName: string
  managerName: string
}

export function messageFor(kind: MessageKind, ctx: MessageContext, extra: { interview?: Interview } = {}): Message {
  const first = ctx.candidateName.trim().split(/\s+/)[0]
  const sign = `\n\n${ctx.managerName}\n${ctx.nurseryName}`
  switch (kind) {
    case 'received':
      return {
        subject: `We've got your application – ${ctx.positionTitle}`,
        body: `Hi ${first}, thanks for applying to be our ${ctx.positionTitle}. We'll be in touch soon. You can check where your application stands at any time using your status link.${sign}`,
      }
    case 'contact':
      return {
        subject: `Your application to ${ctx.nurseryName}`,
        body: `Hi ${first}, thanks for applying for the ${ctx.positionTitle} role. I'd love to hear a bit more about you. Could you give me a call or reply with a good time to talk?${sign}`,
      }
    case 'invite': {
      const i = extra.interview
      const details = i
        ? `\n\nWhen: ${formatDateTimeLong(i.at)}\n${i.mode === 'online' ? `Where: online, join here: ${i.location}` : `Where: ${i.location}`}\n\nIf that time doesn't work, just reply and we'll find another.`
        : ' Please reply with a couple of times that work for you this week.'
      return {
        subject: `Interview invitation – ${ctx.positionTitle}`,
        body: `Hi ${first}, we'd like to ${i?.mode === 'online' ? 'meet you online' : 'invite you in to meet the team and see the room'}.${details}${sign}`,
      }
    }
    case 'offer':
      return {
        subject: `Job offer – ${ctx.positionTitle}`,
        body: `Hi ${first}, I'm delighted to offer you the ${ctx.positionTitle} role at ${ctx.nurseryName}. I'll send the details of the offer separately. Let me know if you have any questions.${sign}`,
      }
    case 'hire':
      return {
        subject: `Welcome to ${ctx.nurseryName}`,
        body: `Hi ${first}, welcome to the team! You'll receive an invitation to the Famly app so you can see your rota before your first day.${sign}`,
      }
    case 'reject':
      return {
        subject: `Your application to ${ctx.nurseryName}`,
        body: `Hi ${first}, thank you for applying for the ${ctx.positionTitle} role. We won't be taking your application further this time. We'd be glad to hear from you again for future roles.${sign}`,
      }
    case 'position_filled':
      return {
        subject: `Update on the ${ctx.positionTitle} role`,
        body: `Hi ${first}, thank you for applying for the ${ctx.positionTitle} role. The position has now been filled, so we won't be taking your application further. We'd be glad to hear from you for future roles.${sign}`,
      }
    case 'lapse':
      return {
        subject: `Closing your application to ${ctx.nurseryName}`,
        body: `Hi ${first}, we haven't been able to reach you, so we're closing your application for the ${ctx.positionTitle} role for now. If you're still interested, just reply to this email.${sign}`,
      }
  }
}
