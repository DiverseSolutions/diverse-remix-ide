import { RemixApp } from '@remix-ui/app'
import React, { useEffect, useRef, useState } from 'react'
import { render } from 'react-dom'
import * as packageJson from '../../../../../package.json'
import { fileSystem, fileSystems } from '../files/fileSystem'
import { indexedDBFileSystem } from '../files/filesystems/indexedDB'
import { localStorageFS } from '../files/filesystems/localStorage'
import { fileSystemUtility, migrationTestData } from '../files/filesystems/fileSystemUtility'
import './styles/preload.css'
const _paq = window._paq = window._paq || []

export const Preload = () => {

    const [supported, setSupported] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)
    const [showDownloader, setShowDownloader] = useState<boolean>(false)
    const remixFileSystems = useRef<fileSystems>(new fileSystems())
    const remixIndexedDB = useRef<fileSystem>(new indexedDBFileSystem())
    const localStorageFileSystem = useRef<fileSystem>(new localStorageFS())
    // url parameters to e2e test the fallbacks and error warnings
    const testmigrationFallback = useRef<boolean>(window.location.hash.includes('e2e_testmigration_fallback=true') && window.location.host === '127.0.0.1:8080' && window.location.protocol === 'http:')
    const testmigrationResult =  useRef<boolean>(window.location.hash.includes('e2e_testmigration=true') && window.location.host === '127.0.0.1:8080' && window.location.protocol === 'http:')
    const testBlockStorage =  useRef<boolean>(window.location.hash.includes('e2e_testblock_storage=true') && window.location.host === '127.0.0.1:8080' && window.location.protocol === 'http:')

    function loadAppComponent() {
        import('../../app').then((AppComponent) => {
            const appComponent = new AppComponent.default()
            appComponent.run().then(() => {
                render(
                    <>
                        <RemixApp app={appComponent} />
                    </>,
                    document.getElementById('root')
                )
            })
        }).catch(err => {
            _paq.push(['trackEvent', 'Preload', 'error', err && err.message])
            console.log('Error loading Remix:', err)
            setError(true)
        })
    }

    const downloadBackup = async () => {
        setShowDownloader(false)
        const fsUtility = new fileSystemUtility()
        await fsUtility.downloadBackup(remixFileSystems.current.fileSystems['localstorage'])
        await migrateAndLoad()
    }

    const migrateAndLoad = async () => {
        setShowDownloader(false)
        const fsUtility = new fileSystemUtility()
        const migrationResult = await fsUtility.migrate(localStorageFileSystem.current, remixIndexedDB.current)
        _paq.push(['trackEvent', 'Migrate', 'result', migrationResult?'success' : 'fail'])
        await setFileSystems()
    }

    const setFileSystems = async() => {
        const fsLoaded = await remixFileSystems.current.setFileSystem([(testmigrationFallback.current || testBlockStorage.current)? null: remixIndexedDB.current, testBlockStorage.current? null:localStorageFileSystem.current])
        if (fsLoaded) {
            console.log(fsLoaded.name + ' activated')
            _paq.push(['trackEvent', 'Storage', 'activate', fsLoaded.name])
            loadAppComponent()
        } else {
            _paq.push(['trackEvent', 'Storage', 'error', 'no supported storage'])
            setSupported(false)
        }
    }

    const testmigration = async() => {        
        if (testmigrationResult.current) {
            const fsUtility = new fileSystemUtility()
            fsUtility.populateWorkspace(migrationTestData, remixFileSystems.current.fileSystems['localstorage'].fs)
        }
    }

    useEffect(() => {
        async function loadStorage() {
            await remixFileSystems.current.addFileSystem(remixIndexedDB.current) || _paq.push(['trackEvent', 'Storage', 'error', 'indexedDB not supported'])
            await remixFileSystems.current.addFileSystem(localStorageFileSystem.current) || _paq.push(['trackEvent', 'Storage', 'error', 'localstorage not supported'])
            await testmigration()
            remixIndexedDB.current.loaded && await remixIndexedDB.current.checkWorkspaces()
            localStorageFileSystem.current.loaded && await localStorageFileSystem.current.checkWorkspaces()
            remixIndexedDB.current.loaded && ( (remixIndexedDB.current.hasWorkSpaces || !localStorageFileSystem.current.hasWorkSpaces)? await setFileSystems():setShowDownloader(true))
            !remixIndexedDB.current.loaded && await setFileSystems()
        }
        loadStorage()
    }, [])

    return <>
        <div className='preload-container'>
            <div className='preload-logo pb-4'>
                {logo}
                <div className="mt-4 info-secondary splash">
                    Diverse REMIX IDE
                    <br />
                    <span className='version'> v{packageJson.version}</span>
                </div>
            </div>
            {!supported ?
                <div className='preload-info-container alert alert-warning'>
                    Your browser does not support any of the filesystems required by Remix.
                    Either change the settings in your browser or use a supported browser.
                </div> : null}
            {error ?
                <div className='preload-info-container alert alert-danger text-left'>
                    An unknown error has occurred while loading the application.<br></br>
                    Doing a hard refresh might fix this issue:<br></br>
                    <div className='pt-2'>
                    Windows:<br></br>
                    - Chrome: CTRL + F5 or CTRL + Reload Button<br></br>
                    - Firefox: CTRL + SHIFT + R or CTRL + F5<br></br>
                    </div>
                    <div className='pt-2'>
                    MacOS:<br></br>
                    - Chrome & FireFox: CMD + SHIFT + R or SHIFT + Reload Button<br></br>
                    </div>
                    <div className='pt-2'>
                    Linux:<br></br>
                    - Chrome & FireFox: CTRL + SHIFT + R<br></br>
                    </div>
                </div> : null}
            {showDownloader ?
                <div className='preload-info-container alert alert-info'>
                    This app will be updated now. Please download a backup of your files now to make sure you don't lose your work.
                    <br></br>
                    You don't need to do anything else, your files will be available when the app loads.
                    <div onClick={async () => { await downloadBackup() }} data-id='downloadbackup-btn' className='btn btn-primary mt-1'>download backup</div>
                    <div onClick={async () => { await migrateAndLoad() }} data-id='skipbackup-btn' className='btn btn-primary mt-1'>skip backup</div>
                </div> : null}
            {(supported && !error && !showDownloader) ?
                <div>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div> : null}
        </div>
    </>
}

const logo = (
  <img src="https://www.dsolutions.mn/static/media/logo-no-text.8057f73a.png" height="200" width="200" alt="" />
)
