import React, { Component } from 'react';
import './App.css';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import _ from 'lodash';

let map;
let bounds = new window.window.google.maps.LatLngBounds();
let sub_area;
let coordinates=[];
let color = ['#FF0000', '#4286f4','#ffff00','#ff00b2','#bb00ff','#00ffff','#26ff00','#00ff87'];
let polygonArray;

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
      selectedOptions: []
    }
    this._handleSearch = this._handleSearch.bind(this);
    this.renderCoordinate = this.renderCoordinate.bind(this);

  }

  componentDidMount(){
    this._initMap()
  }

  componentDidUpdate() {
    console.log(this.state.options.geojson.coordinates)
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
    window.window.google.maps.event.addListener(map, "click", (event) => {
      let lat = event.latLng.lat();
      let lng = event.latLng.lng();
      // populate yor box/field with lat, lng
      // alert("Lat=" + lat + "; Lng=" + lng);
      this.addCoordinate(lat, lng);
    });

    var drawingManager = new window.google.maps.drawing.DrawingManager({
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
      let coords;
      for (var i = 0; i < polygon.getPath().getLength(); i++) {
        coords += polygon.getPath().getAt(i).toUrlValue(6);
      }
      console.log(coords);
      polygonArray.push(polygon);
    });
  }

  _handleSearch(query) {
    if (!query) {
      return;
    }
    console.log(query)
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}&polygon_geojson=1&format=json`)
      .then(resp => resp.json())
      .then(data => {
        let filterGeoJsonType = data.filter(function(data){
          return data.geojson.type === "MultiPolygon" || data.geojson.type === "Polygon"
        });
        let reducedGeoJsonType = filterGeoJsonType.map(data => {
           data.geojson.coordinates[0] = data.geojson.coordinates[0].filter((_, i) => (i%50 == 0));
           return data;
        })
        console.log(reducedGeoJsonType);
        this.setState({options: reducedGeoJsonType});
      });
    }, 1000)
  }


  testOpt = [{
    geojson: {
      type: "Polygon",
      coordinates: [[]]
    }
  }];

  async addCoordinate(lat, lng) {
    console.log(coordinates);
    console.log(this.state.options);
    const { options } = this.state;
    options[0].geojson.coordinates[0].push([lat, lng]);
    // fetch(`https://nominatim.openstreetmap.org/search.php?q=${"jakarta"}&polygon_geojson=1&format=json`)
    //   .then(resp => resp.json())
    //   .then(data => {
    //     let filterGeoJsonType = data.filter(function(data){
    //       return data.geojson.type === "MultiPolygon" || data.geojson.type === "Polygon"
    //     });
    //     let reducedGeoJsonType = filterGeoJsonType.map(data => {
    //        data.geojson.coordinates[0] = data.geojson.coordinates[0].filter((_, i) => (i%50 == 0));
    //        return data;
    //     })
    //     console.log(JSON.stringify(reducedGeoJsonType));
    //     this.setState({options: reducedGeoJsonType});
    //     this._handleChange(options)
    //   });


    let newOpt = JSON.parse('[{"geojson":{"type":"Polygon","coordinates":[[[106.3146732,-5.4996381],[106.710827,-6.096434],[106.685589,-6.1203878],[106.692686,-6.174994],[106.714938,-6.191058],[106.950712,-6.219907],[106.96538,-6.207833],[106.967868,-6.198644],[106.972505,-6.146192],[106.9701758,-6.0991407]]]}}]');


    this.testOpt[0].geojson.coordinates[0].push([lng, lat]);

    //await this.setState({options: newOpt});
    this._handleChange(this.testOpt);
  }

  
  renderCoordinate(paths){
    coordinates = [];
    paths.map(loc => {
      coordinates.push({"lat": loc[1], "lng": loc[0]});
      bounds.extend({"lat": loc[1], "lng": loc[0]});
    })
    // paths.map((location) =>{
    //     if(position %10 === 0){
    //       coordinates.push({"lat": location[1], "lng": location[0]});
    //       bounds.extend({"lat": location[1], "lng": location[0]});
    //     }
    //     position++
    //     return true;
    // });
  }

  renderToMaps (selectedOptions) {
    selectedOptions.forEach((option) => {
      
      // if(option.geojson.type === "MultiPolygon"){
      //   this.renderCoordinate(option.geojson.coordinates[0][0]);
      // }else if(option.geojson.type === "Polygon"){
      //   this.renderCoordinate(option.geojson.coordinates[0]);
      // }else{
      //   alert('option.geojson.type: MultiPolygon & Polygon');
      // }
      // this.renderCoordinate(coordinates);

      this.renderCoordinate(option.geojson.coordinates[0]);
      
      if(coordinates.length > 1){
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

  render() {
    return (
      <div className="container" style={{height: `100%`}}>
        <div className="info"></div>
        <div className="page-header">
            <h1>Area Geofencing on a window.google Maps - React JS Example Projects</h1>
          </div>
          <p className="lead">
            Welcome to the first series React JS Example Projects. This series explain how to create Area Geofencing on a window.google Maps with React JS, hopefully we can learn together.
            <br></br>
            To create area geofencing we must find area boundaries and draw on window.google maps as polygon. During the writing of this series, area boundaries feature not available in the window.google Maps API. 
            The solution is using OpenStreetMap API for getting area boundaries <a href="#">more...</a>
          </p>
          <a href="https://www.youtube.com/watch?v=hLaRG0uZPWc" className="btn btn-primary">DEMO</a> &nbsp;
          <a href="https://github.com/safeimuslim/gmaps-geofence" className="btn btn-primary">DOWNLOAD</a> &nbsp;
          <br></br>&nbsp;
           <AsyncTypeahead
                align="justify"
                multiple
                labelKey="display_name"
                onSearch={this._handleSearch.bind(this)}
                onChange={this._handleChange.bind(this)}
                options={this.state.options}
                placeholder="Search city, ex: tomang or jakarta selatan..."
                renderMenuItemChildren={(option, props, index) => (
                  <div>
                    <span>{option.display_name}</span>
                  </div>
                )}/>
              
              <div className="maps" id="map"></div>

              <footer className="footer">
                <p>developed by <a href="https://github.com/safeimuslim">@safeimuslim</a></p>
              </footer>
      </div>
    );
  }
}

export default App;
