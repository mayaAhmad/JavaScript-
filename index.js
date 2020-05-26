'use strict';
//require
const nano = require('nano')('http://maya:maya@localhost:5984');
const express = require('express');
let expressServer = express();

expressServer.use(express.static('public', {
    extensions: ['html']
}));
const http = require('http');
let httpServer = http.Server(expressServer);
const socketIo = require('socket.io');
let io = socketIo(httpServer);


//const
const FILMS = [];
const KINOSAALS = [];
const PLATZS = [];
let docCount;
const films = [];
let f;
let FILMVORFUHRUNGS = [];
let einFilm;
let einFilmVorfurung;

let film = 'film';
let kinosaal = 'kinosaal';
let platz = 'platz';
let filmvorfuhrung = 'filmvorfuhrung';
let dbFilm = nano.db.use(film);
let dbKinosaal = nano.db.use(kinosaal);;
let dbPlatz = nano.db.use(platz);;
let dbFilmvorfuhrung = nano.db.use(filmvorfuhrung);


class Film {
    constructor(
        _id,
        _rev,
        name,
        cast,
        reigie,
        Produzent,
        originalTitel,
        produktionsJahr,
        produktionsLand,
        verleih,
        typFilm,
        filmHandlung,
        filmsImage
    ) {
        this._id = _id;
        this._rev = _rev;
        this.name = name;
        this.cast = cast;
        this.reigie = reigie;
        this.Produzent = Produzent;
        this.originalTitel = originalTitel,
            this.produktionsJahr = produktionsJahr;
        this.produktionsLand = produktionsLand;
        this.verleih = verleih;
        this.typFilm = typFilm;
        this.filmHandlung = filmHandlung;
        this.filmsImage = filmsImage;

    }
}
class Kinosaal {
    constructor(_id,
        _rev,
        saalNummer,
        platz_id
    ) {
        this._id = _id;
        this._rev = _rev;
        this.saalNummer = saalNummer;
        this.platz_id = platz_id;

    }
}

class Filmvorfuhrung {
    constructor(
        _id,
        _rev,
        kinosaal_id,
        film_id,
        filmStart,
        filmEnde,
        tagFilm,
        filmBeginn,
        lufZeit
    ) {
        this._id = _id;
        this.rev = _rev;
        this.kinosaal_id = kinosaal_id;
        this.film_id = film_id;
        this.filmStart = filmStart;
        this.filmEnde = filmEnde;
        this.tagFilm = tagFilm;
        this.filmBeginn = filmBeginn;
        this.lufZeit = lufZeit;
    }

}
class Platz {
    constructor(_id,
        _rev,
        platzNummer,
        besetzt,
        kundeVorname,
        kundeNachname
    ) {
        this._id = _id;
        this._rev = _rev;
        this.platzNummer = platzNummer;
        this.besetzt = besetzt;
        this.kundeVorname = kundeVorname;
        this.kundeNachname = kundeNachname;
    }
}


let names = [];
//حطيت الداتا بقلب مصقوفه 
nano.db.get("film").then(
    antwort => {
        docCount = antwort.doc_count;
        //console.log(antwort)
    })


dbFilm.list().then(
    antwort => {

        return Promise.all(antwort.rows.map(row => dbFilm.get(row.id)));
    }
).then(
    antwort => {
        antwort.forEach(el => {
            f = new Film(el._id,
                el._rev,
                el.name,
                el.cast,
                el.reigie,
                el.Produzent,
                el.originalTitel,
                el.produktionsJahr,
                el.produktionsLand,
                el.verleih,
                el.typFilm,
                el.filmHandlung,
                el.filmsImage);
            films.push(f);
            // console.log(f)

        })
    }
).then(
    antwort => {

        io.on('connect', socket => {
            //console.log(socket.id);

            io.emit('nachricht', films);
        })
    }
).catch(
    console.log
)

/** dbFilm.list().then(
   antwort => {
       antwort.rows.forEach( row =>{
           dbFilm.get( row.id ).then(
               console.log
           )})
   }
 
).catch(
   console.log
)
*/

//قراءه بيانات عامود محدد
/** dbKinosaal.list().then(
    antwort => {
        return Promise.all(antwort.rows.map(row => dbKinosaal.get(row.id)
        ));
    }
).then(
    antwort => {
        antwort.forEach(el => {
            console.log(el.saalNummer)
        })
    }
)
*/
/**.then(
    antwort => {
        return dbFilmvorfuhrung.view('viewFilmId', 'viewFilmId');
 
    }
).then(
    antwort => {
        return antwort.rows.forEach(el => {
         
          dbFilm.list().then(
                antwort => {
                  console.log(el.key);
                 dbFilm.find({
                        selector: {
                            _id: el.key
                        }
                    })
 
                }
          )
        })
    }
 
    ).then(antwort=>console.log(antwort)
            ).catch(
        console.log
    )
*/


io.on('connect', socket => {
    console.log(socket.id);
    socket.on('idFilm', eingabe => {
        //  console.log(eingabe);

        //mein cod
        dbFilmvorfuhrung.list().then(
            antwort => {

                return Promise.all(antwort.rows.map(row => dbFilmvorfuhrung.get(row.id)));
            }

        ).then(
            antwort => {
                antwort.forEach(el => {
                    if (eingabe == el.film_id) {
                        einFilmVorfurung = new Filmvorfuhrung(
                            el._id,
                            el._rev,
                            el.kinosaal_id,
                            el.film_id,
                            el.filmStart,
                            el.filmEnde,
                            el.tagFilm,
                            el.filmBeginn,
                            el.lufZeit)
                        FILMVORFUHRUNGS.push(einFilmVorfurung);

                    }

                })
                // console.log(FILMVORFUHRUNGS);

            }
        )
            .then(
                antwort => {

                    socket.emit('m', FILMVORFUHRUNGS);


                }
            ).then(

                antwort => {
                    FILMVORFUHRUNGS = [];
                })
            .catch(
                console.log
            )

    })
})

io.on('connect', socket => {
    socket.on('name', name => {
        let Platzs = [];
        let einPlatz;
        let besetzt;
        console.log(name);
        dbKinosaal.list().then(
            antwort => {

                return Promise.all(antwort.rows.map(row => dbKinosaal.get(row.id)));
            }
        ).then(
            antwort => {
                antwort.forEach(el => {
                    if (name.filmvorfuhrungID == el.filmVorfuhrung_id) {
                        //console.log(el.platz_id);
                        if (el.platz_id > 30) {
                            console.log('kein Platz meher');
                            besetzt = false;
                        }
                        else {
                            dbPlatz.insert({
                                "kundeVorname": name.vorName,
                                "kundeNachname": name.nachName
                            })
                            besetzt = true;

                            dbKinosaal.find({
                                selector: {
                                    platz_id: el.platz_id
                                }
                            }).then(
                                antwort => {
                                    antwort.docs[0].platz_id = Number(antwort.docs[0].platz_id) + 1;
                                    // console.log( Number(antwort.docs[0].platz_id));
                                    return dbKinosaal.insert(antwort.docs[0]);
                                }
                            )


                        }
                    }

                })


            }
        ).then(
            antwort => {
                console.log(besetzt);
                socket.emit('besetzt',
                {
                    besetzt:besetzt,
                    vorname:name.vorName,
                   nachname:name.nachName

                } );
            }


        )
        /** .then(
            antwort => {
                // console.log(Platzs);
            }
        ).then(
            antwort => {
                //console.log(Platzs);
                dbPlatz.list().then(
                    antwort => {

                        return Promise.all(antwort.rows.map(row => dbPlatz.get(row.id)));
                    }
                ).then(
                    antwort => {
                        console.log(Platzs);
                        loopout:
                        for (let j = 0; j <= antwort.length; j++) {
                            loop:
                            for (let i = 0; i < 10; i++) {
                                if (Platzs[i] == antwort[j]._id) {
                                    if (antwort[j].besetzt == false) {
                                        // code inset in data einn person
                                        antwort[j].kundeVorname = name.vorName;
                                        antwort[j].kundeNachname = name.nachName;
                                        antwort[j].besetzt = true;
                                        console.log(antwort[j]);
                                        break loopout;
                                    }
                                    if (antwort[j].besetzt == true) {
                                        console.log('besetz');

                                    }

                                }

                            }
                        }

                    }
                )
            }
        )
*/
    })
})

httpServer.listen(80, err => console.log(err || 'Server läuft'));