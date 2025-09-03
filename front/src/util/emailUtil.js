// 이메일 마스킹 함수
export function maskEmail(email) {
  if (!email || !email.includes("@")) return email;

  const [localPart, domain] = email.split("@");
  if (localPart.length <= 3) return email;

  // @ 앞에 3개만 *표로 처리
  const maskedLocal = localPart.substring(0, localPart.length - 3) + "***";
  return `${maskedLocal}@${domain}`;
}
