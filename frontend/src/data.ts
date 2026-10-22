import type { Role } from './lib/api'

export const roleNames: Record<Role, string> = {
  citizen: 'Citizen',
  agent: 'Support Agent',
  admin: 'Administrator',
  mayor: 'Mayor',
}

export const roleHome: Record<Role, string> = {
  citizen: '/citizen/dashboard',
  agent: '/agent/dashboard',
  admin: '/admin/dashboard',
  mayor: '/mayor/dashboard',
}
