/**
 * RoleWithAI's conversational responses based on job data
 * These responses use "we" language to create a supportive, collaborative tone
 */

export function getRoleWithAIApplicationAdvice(
  truthScore: number,
  ghostRisk: 'low' | 'medium' | 'high',
  company: string
): string {
  if (truthScore >= 70 && ghostRisk === 'low') {
    return `We should definitely apply here. ${company} has a strong track record of responding to candidates, and the role has been actively updated recently. Your skills align perfectly with what they're looking for.`
  }

  if (truthScore >= 70 && ghostRisk === 'medium') {
    return `This is a solid opportunity. ${company} has been responsive overall, though they've been a bit slower lately. I'd say it's worth applying, but let's also keep other high-intent options open.`
  }

  if (truthScore >= 40 && ghostRisk === 'low') {
    return `This role matches your experience well, and ${company} has been responsive. While the truth score isn't perfect, I think we should go for it. The risk is manageable.`
  }

  if (truthScore >= 40 && ghostRisk === 'medium') {
    return `There's some risk here, but ${company} has hired from similar postings before. I'd recommend applying, but let's prioritize the higher-intent roles first.`
  }

  if (ghostRisk === 'high') {
    return `Honestly, this feels like a ghost job. ${company} has reposted this multiple times without hiring, and recruiter activity is low. Let's focus your energy on higher-intent opportunities where you'll actually get a response.`
  }

  return `I'm seeing mixed signals here. ${company} has some activity, but it's not consistent. We could apply, but I'd suggest focusing on roles with higher truth scores first.`
}

export function getRoleWithAIStatusNote(
  status: 'applied' | 'interview' | 'ghosted' | 'rejected',
  daysSince: number,
  company: string
): string {
  if (status === 'ghosted' && daysSince > 14) {
    return `I noticed ${company} hasn't responded to anyone this week. I've moved this to 'low priority' for you. Don't take it personally—this is on them, not you.`
  }

  if (status === 'applied' && daysSince > 14) {
    return `It's been ${daysSince} days since we applied. ${company} has been slow to respond lately. I'm keeping an eye on this, but let's focus on newer applications.`
  }

  if (status === 'interview') {
    return `Great news! ${company} is actively engaging. I'm tracking this closely for us.`
  }

  return ''
}
