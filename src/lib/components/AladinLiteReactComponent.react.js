import React, { Component } from "react";
import PropTypes from 'prop-types';

// DSS coloured HiPS. A CDS survey name such as P/DSS2/color asks the
// Strasbourg MOCServer for tiles. These URLs are fetched directly.
// const ALADIN_LITE_SURVEY = 'https://skies.esac.esa.int/DSSColor';
const ALADIN_LITE_SURVEY = 'https://hips.china-vo.org/m/CDS_P_DSS2_color';

// Extra rows appended to Aladin Lite's own survey menu. The built-in list
// is left in place. The suffix marks which mirror serves the tiles.
const ALADIN_LITE_SURVEY_SPARES = [
    { name: 'DSS coloured China', url: 'https://hips.china-vo.org/m/CDS_P_DSS2_color' },
    { name: '2MASS coloured China', url: 'https://hips.china-vo.org/m/CDS_P_2MASS_color' },
    { name: 'SDSS9 coloured China', url: 'https://hips.china-vo.org/m/CDS_P_SDSS9_color' },
    // { name: 'DSS coloured ESA', url: 'https://skies.esac.esa.int/DSSColor' },
];

function aladinSurveyLayer(url) {
    const spare = ALADIN_LITE_SURVEY_SPARES.find((item) => item.url === url);
    if (!spare) {
        return url;
    }
    return A.HiPS(spare.url, { name: spare.name, url: spare.url });
}

function addAladinSurveySpares(aladin) {
    ALADIN_LITE_SURVEY_SPARES.forEach((spare) => {
        aladin.addHiPSToFavorites({
            id: spare.url,
            url: spare.url,
            name: spare.name,
        });
    });
}

function aladinLiteModuleUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i += 1) {
        const src = scripts[i].src || '';
        if (src.indexOf('/aladin_lite_react_component/') !== -1) {
            return `${src.split('/').slice(0, -1).join('/')}/aladin-lite.js`;
        }
    }
    return '/_dash-component-suites/aladin_lite_react_component/aladin-lite.js';
}

function loadAladinLite() {
    if (window.A && window.A.init) {
        return Promise.resolve(window.A.init);
    }
    if (!window.__aladinLiteReady) {
        window.__aladinLiteReady = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            const url = aladinLiteModuleUrl();
            script.textContent = [
                `import AladinApi from ${JSON.stringify(url)};`,
                'const api = AladinApi && AladinApi.init ? AladinApi : AladinApi.default;',
                'window.A = api;',
                'window.dispatchEvent(new Event("aladin-lite-ready"));',
            ].join('\n');
            window.addEventListener('aladin-lite-ready', () => {
                const ready = window.A && window.A.init;
                if (!ready) {
                    reject(new Error('Aladin Lite did not publish A.init'));
                    return;
                }
                Promise.resolve(window.A.init).then(resolve, reject);
            }, {once: true});
            script.addEventListener('error', () => {
                reject(new Error('Aladin Lite script failed to load'));
            });
            document.head.appendChild(script);
        });
    }
    return window.__aladinLiteReady;
}

class AladinLiteReactComponent extends Component {
    constructor(props) {
        super(props);
        this.scriptLoaded = this.scriptLoaded.bind(this);
        this.handleStarClick = this.handleStarClick.bind(this);
        this.handleFieldClick = this.handleFieldClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.state = {
            aladinInstance: null,
            catalog: null,
            selectedStar: null
        };
    }

    componentDidMount() {
        console.log('componentDidMount');
        this._mounted = true;
        loadAladinLite().then(() => {
            if (this._mounted) {
                this.scriptLoaded();
            }
        }).catch((error) => {
            console.error('Aladin Lite failed to start', error);
        });
    }

    componentWillUnmount() {
        this._mounted = false;
    }
    
    componentDidUpdate(prevProps) {
        console.log('componentDidUpdate');
        console.log('this.state=', this.state);
        if (this.state.aladinInstance) {
            console.log('this.state.aladinInstance');
            if (prevProps.target !== this.props.target) {
                console.log('update target', this.props.target);
                this.state.aladinInstance.gotoObject(this.props.target);
            }
            if (prevProps.fov !== this.props.fov) {
                console.log('update fov', this.props.fov);
                this.state.aladinInstance.setFoV(this.props.fov);
            }
            if (prevProps.stars !== this.props.stars) {
                console.log('update stars', this.props.stars)
                this.updateCatalog();
            }

            if (prevProps.selectedStar !== this.props.selectedStar) {
                console.log('update selected star', this.props.selectedStar)
                this.updateSelectedStar();
            }            
        }
    }

    scriptLoaded() {
        const {target, fov, stars} = this.props;
        console.log('scriptLoaded, stars=', stars);
        const win = window;
        const params = { 
            survey: aladinSurveyLayer(ALADIN_LITE_SURVEY), 
            projection: "AIT",
            showReticle: true,
            showSimbadPointerControl: false,
            fov: fov,
            target: target, 
        };
        let aladin = A.aladin('#aladin-lite-div', params);
        addAladinSurveySpares(aladin);
        var cat = A.catalog({
                        name: 'Stars',
                        sourceSize: 12,
                        color: 'red',
                        shape: 'square',
                        // onClick: 'showPopup',
                  });

        (stars || []).forEach(star => {
              cat.addSources([A.source(star.ra, star.dec, {name: star.name})]);
        });
        
        aladin.addCatalog(cat);        
        cat.onClick = this.handleStarClick;
        aladin.on('click', this.handleFieldClick);
        
        this.setState({ catalog: cat });
        this.setState({ aladinInstance: aladin });
    }
    
    updateCatalog() {
        console.log('updateCatalog')
        const { stars } = this.props;
        console.log('stars=', stars)
    }
    
    updateSelectedStar() {
        console.log('updateSelectedeStar');
        console.log('this.state=', this.state);
        const { selectedStar } = this.props;
        console.log('selectedStar=', selectedStar)
        console.log(selectedStar.ra, selectedStar.dec, selectedStar.name);
        if (this.state.aladinInstance && selectedStar) {
            console.log('AHAAA');

            const sources = this.state.catalog.sources;
            console.log('sources=', sources);
            //const selectedSource = sources.find(source => source.name === selectedStar.name);
            var selectedSource = sources.find(source => source.data && source.data.name === selectedStar.name);
            // selectedSource = sources[0]
            console.log('selectedSource=', selectedSource);
            if (this.state.selectedStar) {
                this.state.selectedStar.deselect();
                this.setState({ selectedStar: null })
            }
            if (selectedSource) {
                selectedSource.select();
                this.setState({ selectedStar: selectedSource });
            }
            console.log('AHAAA AHAAA');
        }
    }

    
    handleFieldClick(event) {
        console.log('Field clicked at RA:', event.ra, 'DEC:', event.dec);
        const { setProps } = this.props;

        if (setProps) {
            setProps({ clickedCoordinates: { ra: event.ra, dec: event.dec } });
        }
    }
    
    handleDoubleClick(event) {
        console.log('Double click detected at RA:', event.ra, 'DEC:', event.dec);
        const { setProps } = this.props;

        if (setProps) {
            setProps({ doubleClickedCoordinates: { ra: event.ra, dec: event.dec } });
        }
    }

    
    handleStarClick(object) {
        // console.log('handleStarClick, object=', object)
        console.log('handleStarClick: ra, dec, data=', object.ra, object.dec, object.data);
        // console.log('this.state=', this.state)
        const { setProps } = this.props;
        console.log('setProps=', setProps)
        if (object && object.ra && object.dec && object.data.name) {
            const ra = object.ra;
            const dec = object.dec;
            const name = object.data.name
            if (setProps) {
                setProps({ selectedStar: { ra, dec, name } });
            }
        }
    }

    
    render() {
        const { width, height } = this.props;
        return (
            <div 
                id='aladin-lite-div' 
                style={{ width: `${width}px`, height: `${height}px` }}
            ></div>
        );
    }
}


AladinLiteReactComponent.defaultProps = {
    width: 500,
    height: 500,
    target: '03 47 00.00 +24 07 00.0',
    stars: [],
    fov: 2,
    selectedStar: null,
    clickedCoordinates: null,
    doubleClickedCoordinates: null,
    // onStarClick: () => {}
};

AladinLiteReactComponent.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Aladin window width
     */
    width: PropTypes.number,

    /**
     * Aladin window height
     */
    height: PropTypes.number,
    
    /**
     * The target to display.
     */
    target: PropTypes.string,

    /**
     * The FOV of the display.
     */
    fov: PropTypes.number,
    
    /**
     * list of Marked objects.
     */
    stars: PropTypes.arrayOf(PropTypes.shape({
        ra: PropTypes.number.isRequired,
        dec: PropTypes.number.isRequired,
        name: PropTypes.string
    })),
    
    selectedStar: PropTypes.shape({
        ra: PropTypes.number,
        dec: PropTypes.number,
        name: PropTypes.string,
    }),
    
    clickedCoordinates: PropTypes.shape({
        ra: PropTypes.number.isRequired,
        dec: PropTypes.number.isRequired,
    }),  // Для координат по клику
    
    doubleClickedCoordinates: PropTypes.shape({
        ra: PropTypes.number.isRequired,
        dec: PropTypes.number.isRequired,
    }),  // Для координат по двойному клику
    
    setProps: PropTypes.func
    
    // onStarClick: PropTypes.func
};

export default AladinLiteReactComponent;
