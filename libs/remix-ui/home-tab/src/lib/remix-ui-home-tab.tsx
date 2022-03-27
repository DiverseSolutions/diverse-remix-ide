import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line

import './remix-ui-home-tab.css'
import JSZip from 'jszip'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import PluginButton from './components/pluginButton' // eslint-disable-line
import { QueryParams } from '@remix-project/remix-lib'
import { ThemeContext, themes } from './themeContext'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || [] //eslint-disable-line

/* eslint-disable-next-line */
export interface RemixUiHomeTabProps {
  plugin: any
}

const loadingInitialState = {
  tooltip: '',
  showModalDialog: false,
  importSource: ''
}

const loadingReducer = (state = loadingInitialState, action) => {
  return { ...state, tooltip: action.tooltip, showModalDialog: false, importSource: '' }
}

export const RemixUiHomeTab = (props: RemixUiHomeTabProps) => {
  const { plugin } = props
  const fileManager = plugin.fileManager

  const [state, setState] = useState<{
    themeQuality: { filter: string, name: string },
    showMediaPanel: 'none' | 'twitter' | 'medium',
    showModalDialog: boolean,
    modalInfo: { title: string, loadItem: string, examples: Array<string> },
    importSource: string,
    toasterMsg: string
  }>({
    themeQuality: themes.light,
    showMediaPanel: 'none',
    showModalDialog: false,
    modalInfo: { title: '', loadItem: '', examples: [] },
    importSource: '',
    toasterMsg: ''
  })

  const processLoading = () => {
    const contentImport = plugin.contentImport
    const workspace = fileManager.getProvider('workspace')
    contentImport.import(
      state.importSource,
      (loadingMsg) => dispatch({ tooltip: loadingMsg }),
      (error, content, cleanUrl, type, url) => {
        if (error) {
          toast(error.message || error)
        } else {
          try {
            workspace.addExternal(type + '/' + cleanUrl, content, url)
            plugin.call('menuicons', 'select', 'filePanel')
          } catch (e) {
            toast(e.message)
          }
        }
      }
    )
    setState(prevState => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const [, dispatch] = useReducer(loadingReducer, loadingInitialState)

  const playRemi = async () => {
    remiAudioEl.current.play()
  }

  const remiAudioEl = useRef(null)
  const inputValue = useRef(null)
  const rightPanel = useRef(null)

  useEffect(() => {
    plugin.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
    plugin.on('theme', 'themeChanged', (theme) => {
      // update theme quality. To be used for for images
      setState(prevState => {
        return { ...prevState, themeQuality: theme.quality === 'dark' ? themes.dark : themes.light }
      })
    })
    window.addEventListener('click', (event) => {
      const target = event.target as Element
      const id = target.id
      if (id !== 'remixIDEHomeTwitterbtn' && id !== 'remixIDEHomeMediumbtn' && !rightPanel.current.contains(event.target)) {
        // todo check event.target
        setState(prevState => { return { ...prevState, showMediaPanel: 'none' } })
      }
    })
    // to retrieve twitter feed
    const scriptTwitter = document.createElement('script')
    scriptTwitter.src = 'https://platform.twitter.com/widgets.js'
    scriptTwitter.async = true
    document.body.appendChild(scriptTwitter)
    // to retrieve medium publications
    const scriptMedium = document.createElement('script')
    scriptMedium.src = 'https://www.twilik.com/assets/retainable/rss-embed/retainable-rss-embed.js'
    scriptMedium.async = true
    document.body.appendChild(scriptMedium)
    return () => {
      document.body.removeChild(scriptTwitter)
      document.body.removeChild(scriptMedium)
    }
  }, [])

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const createNewFile = async () => {
    plugin.verticalIcons.select('filePanel')
    await plugin.call('filePanel', 'createNewFile')
  }

  const uploadFile = async (target) => {
    await plugin.call('filePanel', 'uploadFile', target)
  }

  const connectToLocalhost = () => {
    plugin.appManager.activatePlugin('remixd')
  }
  const importFromGist = () => {
    plugin.call('gistHandler', 'load', '')
    plugin.verticalIcons.select('filePanel')
  }
  const switchToPreviousVersion = () => {
    const query = new QueryParams()
    query.update({ appVersion: '0.7.7' })
    _paq.push(['trackEvent', 'LoadingType', 'oldExperience_0.7.7'])
    document.location.reload()
  }
  const startSolidity = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'udapp', 'solidityStaticAnalysis', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidity')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solidity'])
  }
  const startStarkNet = async () => {
    await plugin.appManager.activatePlugin('starkNet_compiler')
    plugin.verticalIcons.select('starkNet_compiler')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'starkNet_compiler'])
  }
  const startSolhint = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solhint'])
    plugin.verticalIcons.select('solhint')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solhint'])
  }
  const startLearnEth = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'LearnEth', 'solidityUnitTesting'])
    plugin.verticalIcons.select('LearnEth')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'learnEth'])
  }
  const startSourceVerify = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'sourcify'])
    plugin.verticalIcons.select('sourcify')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'sourcify'])
  }
  const startPluginManager = async () => {
    plugin.verticalIcons.select('pluginManager')
  }
  const saveAs = (blob, name) => {
    const node = document.createElement('a')
    node.download = name
    node.rel = 'noopener'
    node.href = URL.createObjectURL(blob)
    setTimeout(function () { URL.revokeObjectURL(node.href) }, 4E4) // 40s
    setTimeout(function () {
      try {
        node.dispatchEvent(new MouseEvent('click'))
      } catch (e) {
        const evt = document.createEvent('MouseEvents')
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
          20, false, false, false, false, 0, null)
        node.dispatchEvent(evt)
      }
    }, 0) // 40s
  }
  const downloadFiles = async () => {
    try {
      plugin.call('notification', 'toast', 'preparing files for download, please wait..')
      const zip = new JSZip()
      zip.file("readme.txt", "This is a Remix backup file.\nThis zip should be used by the restore backup tool in Remix.\nThe .workspaces directory contains your workspaces.")
      const browserProvider = fileManager.getProvider('browser')
      await browserProvider.copyFolderToJson('/', ({ path, content }) => {
        zip.file(path, content)
      })
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        const today = new Date()
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
        const time = today.getHours() + 'h' + today.getMinutes() + 'min'
        saveAs(blob, `remix-backup-at-${time}-${date}.zip`)
        _paq.push(['trackEvent', 'Backup', 'download', 'home'])
      }).catch((e) => {
        _paq.push(['trackEvent', 'Backup', 'error', e.message])
        plugin.call('notification', 'toast', e.message)
      })
    } catch (e) {
      plugin.call('notification', 'toast', e.message)
    }
  }

  const restoreBackupZip = async () => {
    await plugin.appManager.activatePlugin(['restorebackupzip'])
    await plugin.call('mainPanel', 'showContent', 'restorebackupzip')
    plugin.verticalIcons.select('restorebackupzip')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'restorebackupzip'])
  }

  const showFullMessage = (title: string, loadItem: string, examples: Array<string>) => {
    setState(prevState => {
      return { ...prevState, showModalDialog: true, modalInfo: { title: title, loadItem: loadItem, examples: examples } }
    })
  }

  const hideFullMessage = () => { //eslint-disable-line
    setState(prevState => {
      return { ...prevState, showModalDialog: false, importSource: '' }
    })
  }

  const maxHeight = Math.max(window.innerHeight - 150, 250) + 'px'
  const examples = state.modalInfo.examples.map((urlEl, key) => (<div key={key} className="p-1 user-select-auto"><a>{urlEl}</a></div>))
  const elHeight = '4000px'
  return (
    <>
      <ModalDialog
        id='homeTab'
        title={ 'Import from ' + state.modalInfo.title }
        okLabel='Import'
        hide={ !state.showModalDialog }
        handleHide={ () => hideFullMessage() }
        okFn={ () => processLoading() }
      >
        <div className="p-2 user-select-auto">
          { state.modalInfo.loadItem !== '' && <span>Enter the { state.modalInfo.loadItem } you would like to load.</span> }
          { state.modalInfo.examples.length !== 0 &&
          <>
            <div>e.g</div>
            <div>
              { examples }
            </div>
          </> }
          <input
            ref={inputValue}
            type='text'
            name='prompt_text'
            id='inputPrompt_text'
            className="w-100 mt-1 form-control"
            data-id="homeTabModalDialogCustomPromptText"
            value={state.importSource}
            onInput={(e) => {
              setState(prevState => {
                return { ...prevState, importSource: inputValue.current.value }
              })
            }}
          />
        </div>
      </ModalDialog>
      <Toaster message={state.toasterMsg} />
      <div className="d-flex flex-column ml-4" id="remixUiRightPanel">
        <div className="border-bottom d-flex flex-column mr-4 pb-3 mb-3">
          <div className="d-flex justify-content-between ">
            <div className="mx-4 my-4 d-flex">
              <label style={ { fontSize: 'xxx-large', height: 'auto', alignSelf: 'flex-end' } }>Diverse Remix IDE</label>
            </div>
            <div className="mr-4 d-flex">
              <img className="mt-5 mb-0 remixui_home_logoImg" src="data:image/png;base64,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" alt=""></img>
                <audio
                id="remiAudio"
                muted={false}
                src="assets/audio/remiGuitar-single-power-chord-A-minor.wav"
                ref={remiAudioEl}
              ></audio>
          </div>
                </div>
        </div>
        <div className="row mx-2 mr-4" data-id="landingPageHpSections">
          <div className="ml-3">
            <div className="mb-3">
              <h4>Featured Plugins</h4>
              <div className="d-flex flex-row pt-2">
                <ThemeContext.Provider value={ state.themeQuality }>
                  <PluginButton imgPath="assets/img/solidityLogo.webp" envID="solidityLogo" envText="Solidity" callback={() => startSolidity()} />
                  <PluginButton imgPath="assets/img/starkNetLogo.webp" envID="starkNetLogo" envText="StarkNet" l2={true} callback={() => startStarkNet()} />
                  <PluginButton imgPath="assets/img/solhintLogo.webp" envID="solhintLogo" envText="Solhint linter" callback={() => startSolhint()} />
                  <PluginButton imgPath="assets/img/learnEthLogo.webp" envID="learnEthLogo" envText="LearnEth" callback={() => startLearnEth()} />
                  <PluginButton imgPath="assets/img/sourcifyLogo.webp" envID="sourcifyLogo" envText="Sourcify" callback={() => startSourceVerify()} />
                  <PluginButton imgPath="assets/img/moreLogo.webp" envID="moreLogo" envText="More" callback={startPluginManager} />
                </ThemeContext.Provider>
              </div>
            </div>
            <div className="d-flex">
              <div className="file">
                <h4>File</h4>
                <p className="mb-1">
                  <i className="mr-2 far fa-file"></i>
                  <label className="ml-1 mb-1 remixui_home_text" onClick={() => createNewFile()}>New File</label>
                </p>
                <p className="mb-1">
                  <i className="mr-2 far fa-file-alt"></i>
                  <label className="ml-1 remixui_home_labelIt remixui_home_bigLabelSize remixui_home_text" htmlFor="openFileInput">
                    Open Files
                  </label>
                  <input title="open file" type="file" id="openFileInput" onChange={(event) => {
                    event.stopPropagation()
                    plugin.verticalIcons.select('filePanel')
                    uploadFile(event.target)
                  }} multiple />
                </p>
                <p className="mb-1">
                  <i className="mr-1 far fa-hdd"></i>
                  <label className="ml-1 remixui_home_text" onClick={() => connectToLocalhost()}>Connect to Localhost</label>
                </p>
                <p className="mb-1">
                  <i className="mr-1 far fa-download"></i>
                  <label className="ml-1 remixui_home_text" onClick={() => downloadFiles()}>Download Backup</label>
                </p>
                <p className="mb-1">
                  <i className="mr-1 far fa-upload"></i>
                  <label className="ml-1 remixui_home_text" onClick={() => restoreBackupZip()}>Restore Backup</label>
                </p>
                <p className="mt-3 mb-0"><label>LOAD FROM:</label></p>
                <div className="btn-group">
                  <button className="btn mr-1 btn-secondary" data-id="landingPageImportFromGistButton" onClick={() => importFromGist()}>Gist</button>
                  <button className="btn mx-1 btn-secondary" data-id="landingPageImportFromGitHubButton" onClick={() => showFullMessage('Github', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol'])}>GitHub</button>
                  <button className="btn mx-1 btn-secondary" onClick={() => showFullMessage('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>'])}>Ipfs</button>
                  <button className="btn mx-1 btn-secondary" onClick={() => showFullMessage('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol'])}>https</button>
                </div>
              </div>
              <div className="ml-4 pl-4">
                <h4>Resources</h4>
                <p className="mb-1">
                  <img id='remixHhomeWebsite' className="mr-2 remixui_home_image" src="https://www.dsolutions.mn/static/media/logo-no-text.8057f73a.png" style={ { filter: state.themeQuality.filter } } alt=''></img>
                  <a className="remixui_home_text" target="__blank" href="https://github.com/DiverseSolutions">Diverse Github</a>
                </p>
                <p className="mb-1">
                  <img id='remixHhomeWebsite' className="mr-2 remixui_home_image" src="https://www.dsolutions.mn/static/media/logo-no-text.8057f73a.png" style={ { filter: state.themeQuality.filter } } alt=''></img>
                  <a className="remixui_home_text" target="__blank" href="https://dsolutions.mn/">Diverse Website</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column remixui_home_rightPanel">
          <div className="d-flex pr-3 py-2 align-self-end" id="remixIDEMediaPanelsTitle">
          </div>
          <div
            className="mr-3 d-flex bg-light remixui_home_panels"
            style={ { visibility: state.showMediaPanel === 'none' ? 'hidden' : 'visible' } }
            id="remixIDEMediaPanels"
            ref={rightPanel}
          >
            <div id="remixIDE_MediumBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" style={ { maxHeight: maxHeight } }>
              <div id="medium-widget" className="px-3 remixui_home_media" hidden={state.showMediaPanel !== 'medium'} style={ { maxHeight: '10000px' } }>
                <div
                  id="retainable-rss-embed"
                  data-rss="https://medium.com/feed/remix-ide"
                  data-maxcols="1"
                  data-layout="grid"
                  data-poststyle="external"
                  data-readmore="More..."
                  data-buttonclass="btn mb-3"
                  data-offset="-100"
                >
                </div>
              </div>
            </div>
            <div id="remixIDE_TwitterBlock" className="p-2 mx-1 mt-3 mb-0 remixui_home_remixHomeMedia" hidden={state.showMediaPanel !== 'twitter'} style={ { maxHeight: maxHeight, marginRight: '28px' } } >
              <div className="remixui_home_media" style={ { minHeight: elHeight } } >
                <a className="twitter-timeline"
                  data-width="375"
                  data-theme={ state.themeQuality.name }
                  data-chrome="nofooter noheader transparent"
                  data-tweet-limit="18"
                  href="https://twitter.com/EthereumRemix"
                >
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RemixUiHomeTab
