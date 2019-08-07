import React, { Component, Fragment } from 'react';
import './App.css';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import _ from 'lodash';

let map;
let mapPolygon;
let bounds = new window.google.maps.LatLngBounds();
let sub_area;
let coordinates=[];
let color = ['#FF0000', '#4286f4','#ffff00','#ff00b2','#bb00ff','#00ffff','#26ff00','#00ff87'];
let polygonArray = [];
let drawingManager;

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      options: [{
        geojson: {
          type:"Polygon",
          coordinates: [[]]
        }
      }],
      selectedOptions: [],
      geofencing: false
    }
    this.renderCoordinate = this.renderCoordinate.bind(this);
    this.toggleGeofencing = this.toggleGeofencing.bind(this);
  }

  componentDidMount(){
    this._initMap()
  }

  componentDidUpdate(prevProps, prevState) {
    if(!prevState.geofencing) {
      this._initGeofencing();
    } else if(prevState.geofencing) {
      drawingManager.setMap(null);
      //sub_area.setMap(null)
      if(mapPolygon) mapPolygon.setMap(null);
      //map.fitBounds(new window.google.maps.LatLngBounds())
      //bounds.setMap(null);
    }
  }

  _initMap () {
    map = new window.window.google.maps.Map(document.getElementById('map'),{
      center: {lat: -6.226996, lng: 106.819894},
      zoom: 10,
      zoomControl: true,
      zoomControlOptions: {
        position: window.window.google.maps.ControlPosition.RIGHT_CENTER
      },
      scrollwheel: false,
      streetViewControl: false,
      mapTypeControl: false,
      mapTypeId: 'roadmap',
    });
  }

  _initGeofencing() {
    window.window.google.maps.event.addListener(map, "click", (event) => {
      let lat = event.latLng.lat();
      let lng = event.latLng.lng();
      // populate yor box/field with lat, lng
      // alert("Lat=" + lat + "; Lng=" + lng);
      this.addCoordinate(lat, lng);
    });

    drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.MARKER,
          window.google.maps.drawing.OverlayType.CIRCLE,
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.POLYLINE,
          window.google.maps.drawing.OverlayType.RECTANGLE
        ]
      },
      /* not useful on jsfiddle
      markerOptions: {
        icon: 'images/car-icon.png'
      }, */
      circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: false,
        editable: true,
        zIndex: 1
      },
      polygonOptions: {
        fillColor: '#BCDCF9',
        fillOpacity: 0.5,
        strokeWeight: 2,
        strokeColor: '#57ACF9',
        clickable: false,
        editable: false,
        zIndex: 1
      }
    });
    console.log(drawingManager)
    drawingManager.setMap(map)

    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      var path = polygon.getPath()
      mapPolygon = polygon;
      
      var coordinates = [];
  
  for (var i = 0 ; i < path.length ; i++) {
        coordinates.push({
          lat: path.getAt(i).lat(),
          lng: path.getAt(i).lng()
        });
      }
      console.log(coordinates);
      polygonArray.push(polygon);
    });
  }

  async addCoordinate(lat, lng) {
    console.log(coordinates);
    console.log(this.state.options);
    const { options } = this.state;
    options[0].geojson.coordinates[0].push([lat, lng]);
    await this.setState({options});
    this._handleChange(this.state.options);
  }

  
  renderCoordinate(paths){
    coordinates = [];
    paths.map(loc => {
      coordinates.push({"lat": loc[1], "lng": loc[0]});
      bounds.extend({"lat": loc[1], "lng": loc[0]});
    })
  }

  renderToMaps (selectedOptions) {
    selectedOptions.forEach((option) => {
      this.renderCoordinate(option.geojson.coordinates[0]);
      
      if(coordinates.length > 1){

        console.log("coordinates")

        sub_area = new window.window.google.maps.Polygon({
          paths: coordinates,
          strokeColor: color[1],
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color[1],
          fillOpacity: 0.35,
          editable: true
        });
        
        sub_area.setMap(map);
        console.log("sub_area:",)
        map.setOptions({ maxZoom: 15 });
        map.fitBounds(bounds);
  
        coordinates = [];
      }
    })
  }

  _handleChange (option) {
    // this._initMap()
    console.log(this.state.options[0].geojson.coordinates[0])
    this.renderToMaps(option)
  }

  toggleGeofencing() {
    this.setState(state => ({
      geofencing: !state.geofencing
    }))
  }

  render() {
    return (
      <div style={{minWidth: '100%'}}>
        <div style={{width: '18%',float: 'left',height: '100vH'}}>
        <div className="sidebar">
          <div>Sidebar</div>
          <div>
          <span className="geofencing">Geofencing:</span>
          <label className="switch">
            <input type="checkbox" onChange={this.toggleGeofencing} />
            <span className="slider round"></span>
          </label> 
          </div>

        </div>
        </div>
        <div className="container" style={{height: `100%`, width: '82%',float: 'left', padding: '0'}}>
              <div className="maps" id="map"></div>
        </div>
      </div>
    );
  }
}

export default App;
