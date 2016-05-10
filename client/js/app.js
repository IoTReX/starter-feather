var socket = io.connect('http://localhost:8080', {reconnect: true});

const recordObservation = Marbelous.createMarbleDisplay(document.getElementById('marbles-container'));

function visualize(name,observable) {
  observable.subscribe( e => recordObservation(name,e) );
}

let source$ = Rx.Observable.fromEvent(socket, 'tempData').distinctUntilChanged();

visualize('Temperature Data', source$);