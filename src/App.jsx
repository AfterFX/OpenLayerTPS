import React, { useState, useEffect } from "react";
import * as TPS from "./TPS";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import XYZ from "ol/source/XYZ";
import { get as getProjection, addCoordinateTransforms } from "ol/proj";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import "./App.css";
import imageUrl from "./assets/map_clipped.png";

const App = () => {
    const [mainMap, setMainMap] = useState(null);
    const [mapProjection, setMapProjection] = useState(null);
    const [imageProjection, setImageProjection] = useState(null);
    const [imageLayer, setImageLayer] = useState(null);
    const [imageExtent, setImageExtent] = useState([0, 0, 100, 100]);
    const [addNumber, setAddNumber] = useState(0);

    const imageSource = imageUrl;

    const scale = 10;
    useEffect(() => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const width = img.width * scale;
            const height = img.height * scale;
            setImageExtent([0, 0, width, height]);
        };
    }, [imageSource]);

    useEffect(() => {
        proj4.defs(
            "EPSG:3857",
            "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
        );
        register(proj4);

        const mapProj = getProjection("EPSG:3857");
        const imgProj = new Projection({
            code: "georef-image",
            units: "m",
        });

        setMapProjection(mapProj);
        setImageProjection(imgProj);
    }, []);

    useEffect(() => {
        if (mapProjection && imageProjection) {
            const map = new Map({
                layers: [
                    new TileLayer({
                        preload: Infinity,
                        source: new XYZ({
                            url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}&key=AIzaSyDNHHu4A-ZFkYTr1phERFuTGG7tbdRePnM",
                        }),
                    }),
                ],
                target: "map",
                view: new View({
                    projection: mapProjection,
                    center: [-8369529.36, 4868538.97],
                    zoom: 15,
                }),
            });

            const imgLayer = new ImageLayer();
            map.addLayer(imgLayer);

            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({
                            color: "#FF0000",
                        }),
                    }),
                }),
            });
            map.addLayer(vectorLayer);

            setMainMap(map);
            setImageLayer(imgLayer);
        }
    }, [mapProjection, imageProjection]);

    useEffect(() => {
        if (mainMap && imageLayer && imageExtent[2] !== 0 && imageExtent[3] !== 0) {
            handleChanged();
        }
    }, [mainMap, imageLayer, imageExtent, addNumber]);

    const handleChanged = () => {
        const mapPoints = [
            [-8370429.490654901, 4867651.87361489],
            [-8370615.538426359, 4869320.508890055],
            [-8368083.461977787, 4869558.814898979],
            [-8368232.9709453685, 4867723.240033842],
        ];
        const imagePoints = [
            [107.12444972569087, 9.280707359384778],
            [57.2517490433864 + addNumber, 504.26537432548855],
            [806.0133025747704, 574.7787658121335],
            [761.0608751969928, 30.782732147959823],
        ].map((c) => [c[0] * scale, c[1] * scale]);
        addImage(imageSource, imageExtent, mapPoints, imagePoints);

        addPointsToMap(mapPoints);
    };

    const addImage = (source, extent, mapPoints, imagePoints) => {
        imageProjection.setExtent(extent);
        const coeffs = TPS.computeTPSCoefficients(mapPoints, imagePoints);
        addCoordinateTransforms(
            mapProjection,
            imageProjection,
            (point) => {
                // console.log("add");
                return TPS.applyTPSTransformation(coeffs, mapPoints, point);
            },
            (coords) => coords
        );

        imageLayer.setSource(
            new Static({
                attributions: "",
                url: source,
                projection: imageProjection,
                imageExtent: extent,
                interpolate: true,
            })
        );
    };

    const addPointsToMap = (mapPoints) => {
        const vectorSource = mainMap
            .getLayers()
            .getArray()
            .find((layer) => layer instanceof VectorLayer)
            .getSource();

        mapPoints.forEach((point) => {
            const feature = new Feature({
                geometry: new Point(point),
            });
            vectorSource.addFeature(feature);
        });
    };

    return (
        <div id="app">
            <button onClick={() => setAddNumber(addNumber + 100)}>Plus</button>
            <button onClick={() => setAddNumber(addNumber - 100)}>Minus</button>
            <div id="map" className="map"></div>
        </div>
    );
};

export default App;