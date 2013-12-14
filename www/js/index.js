function loadjscssfile(filename, filetype)
{
    var fileref;
    if (filetype === "js")
    {
        //if filename is a external JavaScript file
        fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype === "css")
    {
        //if filename is an external CSS file
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref !== "undefined")
    {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function validateShift(beginShift, endShift, isworked)
{
    if (isworked === "yes" && (beginShift === "" || endShift === ""))
    {
       return false;
    }

    if (beginShift !== "" || endShift !== "")
    {
        var beginShiftHH = beginShift.split(":")[0];
        var beginShiftMM = beginShift.split(":")[1];

        var endShiftHH = endShift.split(":")[0];
        var endShiftMM = endShift.split(":")[1];

        if (endShiftHH < beginShiftHH)
        {
            return false;
        }
        else if (endShiftHH === beginShiftHH && endShiftMM < beginShiftMM)
        {
            return false;
        }
    }

    return true;
}

String.prototype.capitalize = function ()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
};



