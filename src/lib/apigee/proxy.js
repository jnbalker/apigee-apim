class Proxy {
  constructor (request, config) {
    this.request = request
    this.config = config
  }

  setRequest (request) {
    this.request = request
  }

  async list () {
    const response = await this.request(`/organizations/${this.config.organization}/apis`)
    return response.data
  }

  async detail (name) {
    try {
      const deployment = await this.request(`/organizations/${this.config.organization}/apis/${name}/deployments`)
      const revision = deployment.data.environment[1].revision.find((rev) => rev.state === 'deployed')
      const response = await this.request(
        {
          url: `/organizations/${this.config.organization}/apis/${name}/revisions/${revision.name}?format=bundle`,
          responseType: 'stream'
        })
      return response.data
    } catch (e) {
      console.log(`Proxy ${name} is not deployed in ${this.config.environment}`)
      return null
    }
  }

  async deployment (name) {
    const deployment = await this.request(`/organizations/${this.config.organization}/environments/${this.config.environment}/apis/${name}/deployments`)
    return deployment.data.revision.find((rev) => rev.state === 'deployed')
  }

  async add (Proxy, name) {
    const response = await this.request({
      url: `/organizations/${this.config.organization}/apis?action=import&name=${name}`,
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      method: 'POST',
      data: Proxy
    })
    return this.deploy(name, response.data.revision)
  }

  async deploy (name, revision) {
    return this.request.post(`/organizations/${this.config.organization}/environments/${this.config.environment}/apis/${name}/revisions/${revision}/deployments?override=true`, {})
  }

  async delete (name) {
    try {
      await this.request.delete(`/organizations/${this.config.organization}/apis/${name}`)
    } catch (e) {
      console.log(e)
      console.log('Proxy not found. Skipping. ')
    }
  }
}

module.exports = Proxy
