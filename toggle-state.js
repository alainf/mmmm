function toggleState()
{

window.alert("Hello");

var myFlag = document.getElementById("flag-geolocalisation").innerHTML;

window.alert(myFlag);

myFlag === "<i class='fi-check'></i>" ? markup = "<i class='fi-lock'></i>" : markup = "<i class='fi-check'></i>"

document.getElementById("flag-geolocalisation").innerHTML = markup;

}
