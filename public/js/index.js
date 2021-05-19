//modal
function register(){
    let modal = document.getElementById("myModal");
    let span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
    } 
}

function ShowHideDiv() {
    let room_code = document.getElementById("room_code");
    let join = document.getElementById('JOIN');
    let create = document.getElementById('CREATE');
    room_code.style.display = join.checked && !create.checked  ? "block" : "none";
}
