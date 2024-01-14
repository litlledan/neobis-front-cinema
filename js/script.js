document.addEventListener("DOMContentLoaded", () => {
    
    async function getMovies(url){
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': APIKEY,
                'Content-Type': 'application/json',
            },
        })
        const respData = await resp.json()
        // console.log(respData);
        // приводим полученные данные в единый вид
        typicalData(respData)
    }
    
    //при выборе категории
    const URL = [API_URL_PREMIERES, API_URL_CLOSE_RELEASES, API_URL_RELEASES, API_URL_TOP];

    const category = document.querySelectorAll('.category')
    
    for (let i = 0; i < category.length; i++){
        category[i].addEventListener('click', ()=>{
            for (let i = 0; i < category.length; i++){
                category[i].classList.remove('chose');
            }
            getMovies(URL[i]);
            category[i].classList.add('chose');
        })
    }

    // const KEYWORD = document.querySelector('.header__search').value.trim();
    //найти фильм по ключевому слову
    document.querySelector('.search__icon').addEventListener('click', ()=>{
        const KEYWORD = document.querySelector('.header__search').value.trim();
        const API_URL_KEYWORD = `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${KEYWORD}&page=1`;
        getMovies(API_URL_KEYWORD);
        // console.log(KEYWORD);
    })

    //стартовая страница
    getMovies(API_URL_PREMIERES);
    category[0].classList.add('chose')
    
    //привести полученные данные в единый вид
    function typicalData(data){
        if (data.releases){
            data.items = data.releases
            delete data.releases
        }else if(data.films){
            data.items = data.films
            delete data.films
        }
        let selectedMovies = data.items.map(movie => {
            if (movie.filmId && movie.rating){
                return {
                    id: movie.filmId,
                    movieName: movie.nameRu,
                    year: movie.year,
                    movieUrl : movie.posterUrl,
                    genre: movie.genres.map(item => item.genre).join(', '), 
                    rating: movie.rating,
                };
            } else if (!movie.rating && !movie.ratingKinopoisk){
                return {
                    id: movie.kinopoiskId, 
                    movieName: movie.nameRu,
                    year: movie.year,
                    movieUrl : movie.posterUrl,
                    genre: movie.genres.map(item => item.genre).join(', '), 
                };
            }
            else {
                return {
                    id: movie.kinopoiskId, 
                    movieName: movie.nameRu,
                    year: movie.year,
                    movieUrl : movie.posterUrl,
                    genre: movie.genres.map(item => item.genre).join(', '), 
                    rating: movie.ratingKinopoisk,
                };
            }
        });

        showMovies(selectedMovies);
        checkLiked(selectedMovies);
        console.log(selectedMovies) ;  
    }

    // вывод инфо фильма на страницк
    moviesBlock = document.querySelector('.movies-container');
    function showMovies(data){
        moviesBlock.innerHTML = '';

        data.forEach(item =>{
            const movie = document.createElement('div');
            movie.classList.add('movie');
            movie.id = item.id;
            movie.innerHTML = `
                <div class="movie__poster">
                    <img class="movie__poster-img" name="movieUrl" src="${item.movieUrl}" alt="">
                </div>
                <div class="movie__info">
                    <div class="movie__text">
                        <div class="movie__title" name="movieName">${item.movieName}</div>
                        <div class="movie__genre" name="genre">${item.genre}</div>
                        <div class="movie__year" name="year">${item.year}</div>
                    </div>
                    <div class="movie__panel">
                        <div class="movie__rating"><p class="rating" name=""rating>${checkRating(item.rating)}</p></div>
                        <div class="movie__heart heart">
                        </div>
                    </div>

                </div>
            `;
            moviesBlock.appendChild(movie);            
        })
        like();
    }

    //проверка рейтинга
    function checkRating(rating){
        if (rating === null || isNaN(rating)){
            return '-'
        }else{
            return Math.floor(rating*10)/10
        }
    }
    
    //поставить лайк и отправка данных в locslstorage
    const LS = localStorage;
    let movieData = {};
    let movieDataArray = [];
    function like(){
        const hearts = document.querySelectorAll('.heart');
        const movieTitle = document.querySelectorAll('.movie__title');
        const movieUrl = document.querySelectorAll('.movie__poster-img')
        const genres = document.querySelectorAll('.movie__genre');
        const year = document.querySelectorAll('.movie__year');
        const rating = document.querySelectorAll('.rating');
        const movie = document.querySelectorAll('.movie')

        for (let i = 0; i < hearts.length; i++){
            //при нажатии сердечка
            hearts[i].addEventListener('click', ()=>{

                if (hearts[i].classList.contains('liked')){
                    hearts[i].classList.remove('liked');
                    movieDataArray = movieDataArray.filter(movie => movie.movieName !== movieTitle[i].textContent);

                    console.log(movieDataArray)
                    LS.setItem('movieData', JSON.stringify(movieDataArray))

                }else{
                    movieData = {};
                    hearts[i].classList.add('liked');
                    
                    movieData['id'] = movie[i].id;
                    movieData[movieTitle[i].getAttribute('name')] = movieTitle[i].textContent;
                    movieData[movieUrl[i].getAttribute('name')] = movieUrl[i].src;
                    movieData[genres[i].getAttribute('name')] = genres[i].textContent;
                    movieData[year[i].getAttribute('name')] = year[i].textContent;
                    movieData[rating[i].getAttribute('name')] = rating[i].textContent;
                    movieData['status'] = 'liked';

                    movieDataArray.push(movieData);
                    
                    LS.setItem('movieData', JSON.stringify(movieDataArray))
                }
            });
        }
    }
    
    // проверка лайка даже после обновления
    function checkLiked(data){
        if (LS.getItem('movieData')){
            const movieDataArray = JSON.parse(LS.getItem('movieData'));
            const hearts = document.querySelectorAll('.heart');
            for (let i = 0; i < movieDataArray.length; i++){
                for (let j = 0; j < data.length; j++){
                    if (+movieDataArray[i].id === +data[j].id){
                        hearts[j].classList.add('liked');
                    }
                }
            }
        }
    }

    //при выборе категории избранные
    function favoriteMovies(event){
        event.preventDefault()
        movieDataArray = JSON.parse(LS.getItem('movieData'));

        showMovies(movieDataArray);
        checkLiked(movieDataArray)
    }

    document.querySelector('.favorite').addEventListener('click', favoriteMovies)
})


