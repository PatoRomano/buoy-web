// const mqtt = require('mqtt')
//import mqtt from 'mqtt'

//var estado = 'Encendido';
var polyline;
var estadoBtnVer = '';
var estadoBtnOcultar = 'hidden';
var heat;

var markersExist = false;
var solicitado = false;

var heatArrayPacifico = [];
var heatArrayMarMediterraneo = [];
var heatArrayAntartico = [];
var heatArrayIndico = [];
var boyasPacifico = [];
var boyasMarMediterraneo = [];
var boyasAntartico = [];
var boyasIndico = [];

var percentagePacifico = 0;
var percentageMarMediterraneo = 0;
var percentageAntartico = 0;
var percentageIndico = 0;

var mostrarGrafico = false;
//var markers = [];

// connection option
const options = {
    clean: true, // retain session
    connectTimeout: 4000, // Timeout period
    // Authentication information
    //clientId: 'emqx_test',
    username: 'pablo',
    password: 'pablo1997',
}

// Connect string, and specify the connection method by the protocol
// ws Unencrypted WebSocket connection
// wss Encrypted WebSocket connection
// mqtt Unencrypted TCP connection
// mqtts Encrypted TCP connection
// wxs WeChat applet connection
// alis Alipay applet connection
//const connectUrl = 'ws://localhost:8083/mqtt'
//let connectUrl = 'ws://144.22.213.172:8083/mqtt'
//let connectUrl = 'ws://164.152.40.143:8083/mqtt'
let connectUrl = 'ws://140.238.178.141:8083/mqtt'
let client = mqtt.connect(connectUrl, options)


client.on('connect', () => {
    console.log('Conectado')
    client.subscribe("boyas/#", { qos: 0 }, (error) => {
        console.log("Suscrito boyas")
    });
    client.subscribe("trazas/#", { qos: 0 }, (error) => {
        console.log("Suscrito trazas")
    });
    /*     client.subscribe("activacion", { qos: 0 }, (error) => {
            console.log("Recibido activacion")
        }); */
})



client.on('message', (topic, message) => {
    if (topic == "boyas/#" || topic == "boyas/pacifico" || topic == "boyas/antartico" || topic == "boyas/marmediterraneo" || topic == "boyas/indico") {
        process_message(topic, message);
    }
    if (markersExist && topic == 'trazas') {
        drawPolyline(topic, message);
    }
    if (topic == "boyas/pacifico/means" || topic == "boyas/antartico/means" || topic == "boyas/marmediterraneo/means" || topic == "boyas/indico/means") {
        addHeatPoint(topic, message);
    }
})


client.on('reconnect', (error) => {
    console.log('reconnecting:', error)
})

client.on('error', (error) => {
    console.log('Connection failed:', error)
})

/* 
function publicar(accion) {
    if (accion == "Encender") {
        client.publish("activacion", 'on', (error) => {
            estado = 'Encendido';
            console.log("Encendido")
        });
    }
    if (accion == "Apagar") {
        client.publish("activacion", 'off', (error) => {
            estado = 'Apagado';
            console.log("Apagado")
        });
    }
}
 */

function askBuoyRecords(boya) {
    solicitado = true;
    let messageToSend = `{"boya": ` + boya.toString() + `}`;
    client.publish("buscar", messageToSend, (error) => {
        console.log('solicitado ' + boya)
        setTimeout(function name() {
            if (solicitado) {
                avisarError();
            }
        }, 5000)
    });
}

function avisarError() {
    client.publish("error", 'si', (error) => {
        console.log("error avisado")
    });
}


function process_message(topic, message) {
    console.log('Mensaje recibido bajo topico：', topic, '->', message.toString())
    mensaje = message.toString();
    let data = JSON.parse(message);
    console.log(data.latitud);
    console.log(data.longitud)
    //dataArray = mensaje.split([',']);
    //latText = document.getElementById('lat');
    //longText = document.getElementById('long');

    //latText.innerHTML = data.latitud;
    //longText.innerHTML = data.longitud;


    addPoint(topic, data);
    //drawPolyline();
}



function calculateIntensity(temperature) {
    let intensity = temperature*300;
    return intensity;
}



function addHeatPoint(topic, message) {
    console.log('Mensaje recibido bajo topico：', topic, '->', message.toString())
    mensaje = message.toString();
    let data = JSON.parse(message);
    
    let intensity = calculateIntensity(data.temperatura);

    console.log(data.latitud);
    heat = L.heatLayer([
        [data.latitud, data.longitud, intensity], // lat, lng, intensity
    ], { radius: 25 }).addTo(map);
}



function addPoint(topic, data) {
    markersExist = true;

/*     popUpData = 'Boya: ' + data.boya + ' <br>Temperatura: ' + data.temperatura + ' <br> Salinidad: ' +
        data.salinidad + ' <br> Presion: ' + data.presion + '<br>' +
        '<button id="btnVer" class="btn btn-primary btn-sm" onclick="askBuoyRecords(' + data.boya + ') "' + estadoBtnVer + '>Ver traza</button>'
        + '<br>' + '<button id="btnOcultar" class="btn btn-danger btn-sm" onclick="hidePolyline() " ' + estadoBtnOcultar + '>Ocultar traza</button>'; */

        popUpData = 'Boya: ' + data.boya + ' <br>Temperatura: ' + data.temperatura + ' <br> Salinidad: ' +
        data.salinidad + ' <br> Presion: ' + data.presion + ' <br> Latitud: ' + data.latitud
        + ' <br> Longitud: ' + data.longitud + '<br>';

    /*     L.marker([data.latitud, data.longitud]).addTo(map)
        .bindPopup('Temperatura: 12 <br> Humedad: 98 <br> Salinidad: 25 <br> Presion: 100')
        .openPopup();
        
        map.panTo(new L.LatLng(data.latitud, data.longitud));       */

    L.marker([data.latitud, data.longitud]).addTo(map)
        .bindPopup(popUpData, { closeButton: false, closePopupOnClick: false })
        .openPopup()
    /* 
        const jsonText = `{"marker": "` + L.marker([data.latitud, data.longitud]).addTo(map)
        .bindPopup(popUpData, {closeButton: false, closePopupOnClick: false})
        .openPopup().toString() + `" , "btnOcultar": "hidden", "btnVer": ""}`;
    
        markers.push(JSON.parse(jsonText));
    
        console.log(markers[0]) */

    map.panTo(new L.LatLng(data.latitud, data.longitud));

    if (topic == "boyas/pacifico") {
        boyasPacifico.push({
            "temperatura": data.temperatura
        })
    }
    if (topic == "boyas/antartico") {
        boyasAntartico.push({
            "temperatura": data.temperatura
        })
    }
    if (topic == "boyas/marmediterraneo") {
        boyasMarMediterraneo.push({
            "temperatura": data.temperatura
        })
    }
    if (topic == "boyas/indico") {
        boyasIndico.push({
            "temperatura": data.temperatura
        })
    }

    calculatePercentage()
    high()
    //{ "boya": "5905508", "latitud": "-45.92862692212691", "longitud": " -67.54472326736789", "temperatura": "23", "humedad": "72", "salinidad": "11", "presion": "8"}
}

function drawPolyline(topic, array) {

    let valor;
    let traza = [];

    recibido = array.toString().replace(/'/g, `"`).split(';');

    console.log(array.toString().replace(/'/g, `"`))
    console.log(recibido);

    recibido.forEach(element => {
        let data = JSON.parse(element);
        valor = [];
        valor.push(data.latitud);
        valor.push(data.longitud);
        traza.push(valor);
    });
    console.log(traza);

    /* 
        var latlngs = [
            [45.51, -122.68],
            [37.77, -122.43],
            [34.04, -118.2]
        ]; */

    polyline = L.polyline(traza, { color: 'green' }).addTo(map);

    estadoBtnVer = 'hidden'
    $('#btnVer').attr('hidden', true);
    estadoBtnOcultar = ''
    $('#btnOcultar').removeAttr('hidden');

    solicitado = false;
}

function hidePolyline() {
    estadoBtnOcultar = 'hidden'
    $('#btnOcultar').attr('hidden', true);
    polyline.remove()
    estadoBtnVer = ''
    $('#btnVer').removeAttr('hidden');
}


/* function calculatePercentage(arrayBoyas) {
    let cantidad = 
} */

function seleccionarSuscripcion(valor) {

    let topicoSuscripto;
    topicoSuscripto = document.getElementById('topico-suscripto');

    console.log(valor);
    if (valor == "todas") {
        client.subscribe("boyas/#", { qos: 0 }, (error) => {
            console.log("Suscrito boyas")
        });
        topicoSuscripto.innerHTML = "Ver boyas: Todas";
    } else {
        client.unsubscribe("boyas/#", { qos: 0 }, (error) => {
            console.log("Desuscrito boyas")
        });
        if(valor == "marmediterraneo") {
            client.subscribe("boyas/marmediterraneo", { qos: 0 }, (error) => {
                console.log("Suscrito marmediterraneo")
            });
            client.subscribe("boyas/marmediterraneo/means", { qos: 0 }, (error) => {
                console.log("Suscrito marmediterraneo means")
            });
            client.unsubscribe("boyas/pacifico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito pacifico boyas")
            });
            client.unsubscribe("boyas/antartico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito antartico boyas")
            });
            client.unsubscribe("boyas/indico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito indico boyas")
            });
            topicoSuscripto.innerHTML = "Ver boyas: Mar Mediterráneo";
        }
        if(valor == "pacifico") {
            client.subscribe("boyas/pacifico", { qos: 0 }, (error) => {
                console.log("Suscrito pacifico")
            });
            client.subscribe("boyas/pacifico/means", { qos: 0 }, (error) => {
                console.log("Suscrito pacifico means")
            });
            client.unsubscribe("boyas/marmediterraneo/means", { qos: 0 }, (error) => {
                console.log("Desuscrito marmediterraneo boyas")
            });
            client.unsubscribe("boyas/antartico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito antartico boyas")
            });
            client.unsubscribe("boyas/indico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito indico boyas")
            });
            topicoSuscripto.innerHTML = "Ver boyas: Océano Pacífico";
        }
        if(valor == "antartico") {
            client.subscribe("boyas/antartico", { qos: 0 }, (error) => {
                console.log("Suscrito antartico")
            });
            client.subscribe("boyas/antartico/means", { qos: 0 }, (error) => {
                console.log("Suscrito antartico means")
            });
            client.unsubscribe("boyas/marmediterraneo/means", { qos: 0 }, (error) => {
                console.log("Desuscrito marmediterraneo boyas")
            });
            client.unsubscribe("boyas/pacifico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito pacifico boyas")
            });
            client.unsubscribe("boyas/indico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito indico boyas")
            });
            topicoSuscripto.innerHTML = "Ver boyas: Océano Antártico";
        }
        if(valor == "indico") {
            client.subscribe("boyas/indico", { qos: 0 }, (error) => {
                console.log("Suscrito indico")
            });
            client.subscribe("boyas/indico/means", { qos: 0 }, (error) => {
                console.log("Suscrito indico means")
            });
            client.unsubscribe("boyas/marmediterraneo/means", { qos: 0 }, (error) => {
                console.log("Desuscrito marmediterraneo boyas")
            });
            client.unsubscribe("boyas/pacifico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito pacifico boyas")
            });
            client.unsubscribe("boyas/antartico/means", { qos: 0 }, (error) => {
                console.log("Desuscrito antartico boyas")
            });
            topicoSuscripto.innerHTML = "Ver boyas: Océano Índico";
        }
    }
}


function calculatePercentage() {
    total = boyasAntartico.length + boyasMarMediterraneo.length + boyasIndico.length + boyasPacifico.length;
    percentageAntartico = (boyasAntartico.length/total)*100;
    percentageMarMediterraneo = (boyasMarMediterraneo.length/total)*100;
    percentageIndico = (boyasIndico.length/total)*100;
    percentagePacifico = (boyasPacifico.length/total)*100;
}

function high() {
    // Data retrieved from https://netmarketshare.com/
    // Build the chart
    Highcharts.chart('hola', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Cantidad de Boyas por Región'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Mar mediterráneo',
                y: percentageMarMediterraneo,
                sliced: true,
                selected: true
            }, {
                name: 'Océano Índico',
                y: percentageIndico
            }, {
                name: 'Océano Pacífico',
                y: percentagePacifico
            }, {
                name: 'Océano Antártico',
                y: percentageAntartico
            }]
        }]
    });
}