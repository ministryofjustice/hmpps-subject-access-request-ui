export interface HealthResponse {
  components: HealthResponseComponents
}

interface HealthResponseComponents {
  'hmpps-document-management-api': ServiceHealthComponent
  'prison-register': ServiceHealthComponent
  'hmpps-external-users-api': ServiceHealthComponent
  'nomis-user-roles-api': ServiceHealthComponent
  'subject-access-requests-and-delius': ServiceHealthComponent
  'hmpps-locations-inside-prison-api': ServiceHealthComponent
  'hmpps-nomis-mapping-service': ServiceHealthComponent
  sarServiceApis: ServicesHealth
}

interface ServiceHealthComponents {
  [key: string]: ServiceHealthComponent
}

interface ServicesHealth {
  details: ServiceHealthComponents
}

export interface ServiceHealthComponent {
  status: string
  details?: ServiceHealthDetails
}

interface ServiceHealthDetails {
  healthUrl: string
  portalUrl: string
  error?: string
}
