const spinner = gE("spinner");
const movieForm = gE("movieForm");
const model = gE("model");
const updateMovBtn = gE("updateMovBtn");
const modelButton = gE("modelButton");
const addMovBtn = gE("addMovBtn");
const clodeModel = [...document.querySelectorAll(".close-model")];
const titleControl = gE("title");
const genreControl = gE("genre");
const posterControl = gE("poster");
const ratingControl = gE("rating");
const releaseDateControl = gE("releaseDate");
const descriptionControl = gE("description");
const changeUpdateAddText = gE("movieAddOrUpdateText");


const allMoviesContainer = document.getElementById("allMoviesContainer");

function gE(id) {
  return document.getElementById(id);
}

const baseUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const moviesUrl = `${baseUrl}/movies.json`;

function snackBar(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
    timer: 3000,
  });
}

const localState = {
  moviesArray: [],
  editId: null,
};

function toggleSpinner() {
  spinner.classList.toggle("d-none");
}

//nested obj to array converter function 
function convertNestedObjToArr(obj) {
  // let nestedArr = Object.entries(obj);
  // let convertedArr = nestedArr.map(arr => ({...arr[1], id : arr[0]}));
  // localState.moviesArray.unshift(...convertedArr);
  localState.moviesArray = Object.entries(obj).map(el => ({ ...el[1], id: el[0] })).reverse();
}

//generic function for fetch
async function makeApiCall(url, method = "GET", body) {
  try {
    body = body ? JSON.stringify(body) : null;
    let res = await fetch(url, {
      method: method,
      body: body,
      headers: {
        "Content-Type": "application/json",
        "security": "JWT token",
      },
    });

    if (!res.ok) {
      throw new Error("Error while fetching data : " + res.status);
    }

    return await res.json();

  } catch (err) {
    snackBar(err, "error");
    throw new Error(`Error while making api call : ${err}`);
  }
}


//read
async function fetchMovies() {
  try {
    toggleSpinner();
    let data = await makeApiCall(moviesUrl);
    convertNestedObjToArr(data);
    renderMovies(localState.moviesArray);
  } catch (err) {
    snackBar(err, "error");
    console.log(err);
  } finally {
    toggleSpinner();
  }
}

fetchMovies();

function renderMovies(arr) {
  const allMoviesContainer = document.getElementById("allMoviesContainer");
  let res = "";
  arr.forEach((movie) => {
    res += `
            <div class="col-md-3 mb-3" id="${movie.id}">
            <div class="card h-100" id="movieCard">
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${movie.title}</h3>
                </div>
                <div class="col-2">
                  <h4 class="badge badge-warning align-self-center p-2">
                    <span>${movie.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3">
              Updated at : ${movie.updatedAt ? new Date(movie.updatedAt).toLocaleString("en-IN") : "Not updated yet"}</small>
              
              <small class="text-left pl-3">
              Created at &nbsp;: ${new Date(movie.createdAt).toLocaleString("en-IN")} 
              </small>
              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                  />

                  <figcaption>
                    <h3>${movie.title}</h3>
                    <p><strong>Release Date : </strong>${movie.releaseDate}</p>
                    <h5 class="text-info"><strong>Genre : </strong>${movie.genre}</h5>
                    <p>
                      ${movie.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button  onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button  onclick="onDelete(this)" class="btn btn-sm pri-btn">Remove</button>
              </div>
            </div>
          </div>
      `;
    allMoviesContainer.innerHTML = res;
  });
}

//create
async function onSubmit(event) {
  onModelToggle();
  event.preventDefault();
  const movObj = {
    title: titleControl.value,
    releaseDate: releaseDateControl.value,
    rating: ratingControl.value,
    poster: posterControl.value,
    genre: genreControl.value,
    description: descriptionControl.value,
    createdAt: Date.now()
  }
  try {
    toggleSpinner()
    const res = await makeApiCall(moviesUrl, "POST", movObj)
    movObj.id = res.name;
    localState.moviesArray.unshift(movObj);
    console.log(movObj);
    let newMovie = document.createElement("div");
    newMovie.id = res.name;
    newMovie.className = "col-md-3 mb-3";
    newMovie.innerHTML = `
            
            <div class="card h-100" id="movieCard">
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${movObj.title}</h3>
                </div>
                <div class="col-2">
                  <h4 class="badge badge-warning align-self-center p-2">
                    <span>${movObj.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3">
              Updated at : ${movObj.updatedAt ? new Date(movObj.updatedAt).toLocaleString("en-IN") : "Not updated yet"}</small>
              
              <small class="text-left pl-3">
              Created at &nbsp;: ${new Date(movObj.createdAt).toLocaleString("en-IN")} 
              </small>
              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${movObj.poster}"
                    alt="${movObj.title}"
                  />

                  <figcaption>
                    <h3>${movObj.title}</h3>
                    <p><strong>Release Date : </strong>${movObj.releaseDate}</p>
                    <h5 class="text-info"><strong>Genre : </strong>${movObj.genre}</h5>
                    <p>
                      ${movObj.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button onclick="onDelete(this)"class="btn btn-sm pri-btn">Remove</button>
              </div>
            </div>
  `;

    allMoviesContainer.prepend(newMovie);
    movieForm.reset();
    snackBar(`New movie wiht id : ${res.name} is added successfully...`, "success");
  } catch (err) {
    snackBar(err, "error");
    console.log(err);
  } finally {
    toggleSpinner();
  }
}



//delete
async function onDelete(ele) {
  const deleteId = ele.closest(".col-md-3").id;
  try {
    let isConfirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    if (isConfirm.isConfirmed) {
      const deleteUrl = `${baseUrl}/movies/${deleteId}.json`;
      toggleSpinner();
      const res = await makeApiCall(deleteUrl, "DELETe");
      const deleteIndex = localState.moviesArray.findIndex(m => m.id === deleteId);
      localState.moviesArray.splice(deleteIndex, 1);
      ele.closest(".col-md-3").remove();
      snackBar(`MOvie wiht id : ${deleteId} is deleted successfully...`, "success");

    } else {
      toggleSpinner();
    }
  } catch (err) {
    snackBar(err, "error");
    console.log(err);
  } finally {
    toggleSpinner();
  }
}

//edit
function onEdit(ele) {
  onModelToggle();
  const editId = ele.closest(".col-md-3").id;
  const editObj = localState.moviesArray.find(m => m.id === editId);
  localState.editId = editId;

  titleControl.value = editObj.title;
  releaseDateControl.value = editObj.releaseDate;
  ratingControl.value = editObj.rating;
  posterControl.value = editObj.poster;
  genreControl.value = editObj.genre;
  descriptionControl.value = editObj.description;
  changeUpdateAddText.innerText = "Update Movie details";
  addMovBtn.classList.add("d-none");
  updateMovBtn.classList.remove("d-none");

}

//update
async function onUpdate() {
  const updateId = localState.editId;
  const existingObj = localState.moviesArray.find(m => m.id === updateId);
  try {
    const udpatedObj = {
      ...existingObj,
      title: titleControl.value,
      releaseDate: releaseDateControl.value,
      rating: ratingControl.value,
      poster: posterControl.value,
      genre: genreControl.value,
      description: descriptionControl.value,
      updatedAt : Date.now()
    }
    const updateUrl = `${baseUrl}/movies/${updateId}.json`;
    toggleSpinner()
    const res = await makeApiCall(updateUrl, "PATCH", udpatedObj);
    const udpdateIndex = localState.moviesArray.findIndex(m => m.id === updateId);
    localState.moviesArray[udpdateIndex] = udpatedObj;
    let udpateMovie = document.getElementById(updateId);
    udpateMovie.innerHTML = `
                    <div class="card h-100" id="movieCard">
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${udpatedObj.title}</h3>
                </div>
                <div class="col-2">
                  <h4 class="badge badge-warning align-self-center p-2">
                    <span>${udpatedObj.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3">
              Updated at : ${udpatedObj.updatedAt ? new Date(udpatedObj.updatedAt).toLocaleString("en-IN") : "Not updated yet"}</small>
              
              <small class="text-left pl-3">
              Created at &nbsp;: ${new Date(udpatedObj.createdAt).toLocaleString("en-IN")} 
              </small>
              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${udpatedObj.poster}"
                    alt="${udpatedObj.title}"
                  />

                  <figcaption>
                    <h3>${udpatedObj.title}</h3>
                    <p><strong>Release Date : </strong>${udpatedObj.releaseDate}</p>
                    <h5 class="text-info"><strong>Genre : </strong>${udpatedObj.genre}</h5>
                    <p>
                      ${udpatedObj.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button onclick="onDelete(this)"class="btn btn-sm pri-btn">Remove</button>
              </div>
            </div>

    `
    snackBar(`Movie with id : ${updateId} is updated successfully...`, "success");
    movieForm.reset();
    onModelToggle();
  } catch (err) {
    snackBar(err, "error");
    console.log(err);
  } finally {
    toggleSpinner();
  }

}



function onModelToggle() {
  model.classList.toggle("active");
  backDrop.classList.toggle("active");
  addMovBtn.classList.remove("d-none");
  updateMovBtn.classList.add("d-none");
  changeUpdateAddText.innerText = "Add Movie details";
  addMovBtn.classList.remove("d-none");
  updateMovBtn.classList.add("d-none");
}

modelButton.addEventListener("click", onModelToggle);
clodeModel.forEach(btn => {
  btn.addEventListener("click", onModelToggle);
});

movieForm.addEventListener("submit", onSubmit);
updateMovBtn.addEventListener("click", onUpdate);