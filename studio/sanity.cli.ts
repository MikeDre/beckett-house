import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'lk8ts1r7',
    dataset: 'production'
  },
  deployment: {
    appId: "h5apsc1g1x81l26swdr8h8qe",
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
