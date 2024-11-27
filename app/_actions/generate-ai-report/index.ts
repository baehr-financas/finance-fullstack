'use server'
import { db } from '@/app/_lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { isMatch } from 'date-fns'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const generateAiReport = async (month: string) => {
  if (!isMatch(month, 'MM')) {
    throw new Error('Invalid month')
  }
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  const user = await clerkClient().users.getUser(userId)
  const userHasPremiumPlan = user.publicMetadata.subscriptionPlan === 'premium'
  if (!userHasPremiumPlan) {
    throw new Error('User has no premium plan')
  }
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const transactions = await db.transaction.findMany({
    where: {
      date: {
        gte: new Date(`2024-${month}-01`),
        lt: new Date(`2024-${month}-31`),
      },
    },
  })
  const content = `Gere um relatório com insights sobre as minhas finanças, com dicas e orientações de como melhorar minha vida financeira. As transações estão divididas por ponto e vírgula. A estrutura de cada uma é {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
        ${transactions
          .map(
            (transaction) =>
              `${transaction.date.toLocaleDateString('pt-BR')}-R$${transaction.amount}-${transaction.type}-${transaction.category}`,
          )
          .join(';')}`
  const result = await model.generateContent(content)
  // const completion = await gemini.chat.completions.create({
  //   model: 'gpt-4o-mini',
  //   messages: [
  //     {
  //       role: 'system',
  //       content:
  //         'Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças.',
  //     },
  //     {
  //       role: 'user',
  //       content,
  //     },
  //   ],
  // })
  return result.response.text()
}
