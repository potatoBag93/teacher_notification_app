/**
 * 개발용 관리자 계정 설정
 * 
 * 실제 운영환경에서는 사용하지 않습니다.
 * 개발/테스트 목적으로만 사용하세요.
 */

export const DEV_ADMIN_ACCOUNTS = [
  {
    email: 'admin@test.com',
    password: 'admin123!',
    name: '시스템 관리자',
    school: '개발팀',
    isAdmin: true
  },
  {
    email: 'teacher@test.com', 
    password: 'teacher123!',
    name: '테스트 교사',
    school: '테스트초등학교',
    isAdmin: false
  }
]

/**
 * 개발환경에서 관리자 권한 체크를 우회합니다
 */
export const isDevelopmentAdmin = (email: string): boolean => {
  return DEV_ADMIN_ACCOUNTS.some(account => 
    account.email === email && account.isAdmin
  )
}

/**
 * 개발환경에서 사용할 수 있는 계정 목록을 반환합니다
 */
export const getDevAccounts = () => {
  return DEV_ADMIN_ACCOUNTS.map(account => ({
    email: account.email,
    name: account.name,
    school: account.school,
    isAdmin: account.isAdmin
  }))
}
