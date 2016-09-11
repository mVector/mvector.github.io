var b_menu_MouseOver = false;
var b_menu_Expanded = false;
var o_menu_Current = null;
var s_menu_timeoutID = 0;
var a_menu_hiddenCtrls = new Array();

function trim(sString)
{
	return sString.replace(/\s+$/gi, "").replace(/^\s*/gi, "");
}

function navigateTo(sURL)
{
	window.open(sURL, "_self", "", false);
}

function isValidEmail(sEmail)
{
	oPattern = /^([_a-z0-9-]+(\.[_a-z0-9-]+)*)@([a-z0-9-]{2,}(\.[a-z0-9-]{2,})*\.[a-z]{2,3})$/i;
	return oPattern.test(sEmail);
}

function getElementRect(oElement)
{
	var oRect = new Object;
	oRect.left = 0;
	oRect.top = 0;

	var oCursor = oElement;
	while (oCursor != null)
	{
		oRect.left += oCursor.offsetLeft;
		oRect.top += oCursor.offsetTop;
		oCursor = oCursor.offsetParent;
	}

	oRect.right = oRect.left + oElement.offsetWidth;
	oRect.bottom = oRect.top + oElement.offsetHeight;

	return oRect;
}

function inArray(aArray, element)
{
	var i;
	for (i = aArray.length - 1; i >= 0; i--)
	{
		if (aArray[i] == element)
			return true;
	}

	return false;
}

function makeAllControlsVisible()
{
	// Unhide controls that are no longer hidden
	var i;
	for (i = a_menu_hiddenCtrls.length - 1; i >= 0; i--)
		a_menu_hiddenCtrls[i].style.visibility = "visible"
	a_menu_hiddenCtrls = new Array();
}

function isOverlapping(oMenuRect, oControl)
{
	var oCtrlRect = getElementRect(oControl);

	if (oCtrlRect.top < oMenuRect.bottom && oControl.getAttribute("special") != "1")
	{
		if (oCtrlRect.left > oMenuRect.right || oCtrlRect.right < oMenuRect.left)
			return false;
		else
			return true;
	}
	else
		return false;
}

function hideOverlappingControls(oMenu)
{
	var oMenuRect = getElementRect(oMenu);

	var oldHiddenCtrls = a_menu_hiddenCtrls;
	a_menu_hiddenCtrls = new Array();

	var i;
	var aCtrls = document.getElementsByTagName("input");
	for (i = 0; i < aCtrls.length; i++)
	{
		if (	aCtrls[i].getAttribute("type") == "text" ||
			aCtrls[i].getAttribute("type") == "password" ||
			aCtrls[i].getAttribute("type") == "checkbox")
		{
			if (isOverlapping(oMenuRect, aCtrls[i]))
			{
				a_menu_hiddenCtrls[a_menu_hiddenCtrls.length] = aCtrls[i];
				aCtrls[i].style.visibility = "hidden";
			}
		}
	}

	aCtrls = document.getElementsByTagName("select");
	for (i = 0; i < aCtrls.length; i++)
	{
		if (isOverlapping(oMenuRect, aCtrls[i]))
		{
			a_menu_hiddenCtrls[a_menu_hiddenCtrls.length] = aCtrls[i];
			aCtrls[i].style.visibility = "hidden";
		}
	}

	aCtrls = document.getElementsByTagName("textarea");
	for (i = 0; i < aCtrls.length; i++)
	{
		if (isOverlapping(oMenuRect, aCtrls[i]))
		{
			a_menu_hiddenCtrls[a_menu_hiddenCtrls.length] = aCtrls[i];
			aCtrls[i].style.visibility = "hidden";
		}
	}

	// Unhide controls that are no longer hidden
	var i;
	for (i = oldHiddenCtrls.length - 1; i >= 0; i--)
	{
		if (!inArray(a_menu_hiddenCtrls, oldHiddenCtrls[i]))
			oldHiddenCtrls[i].style.visibility = "visible"
	}
}

function menuOver(oMenu)
{
	oMenu.className = oMenu.className + "Over";
	b_menu_MouseOver = true;
	if (b_menu_Expanded)
		showMenu(oMenu);		
}

function menuOut(oMenu)
{
	oMenu.className = oMenu.className.slice(0, -4);
	b_menu_MouseOver = false;
	initMenuCleanup();
}

function submenuOver(oSubmenu)
{
	b_menu_MouseOver = true;
}

function submenuOut(oSubmenu)
{
	b_menu_MouseOver = false;
	initMenuCleanup();
}

function menuItemOver(oItem)
{
	oItem.className = oItem.className + "Over";
}

function menuItemOut(oItem)
{
	oItem.className = oItem.className.slice(0, -4);
}

function hideMenus()
{
	if (o_menu_Current != null)
		o_menu_Current.style.visibility = "hidden";
	b_menu_Expanded = false;
}

function showMenu(oMenu)
{
	var left, top, oCursor;

	if (s_menu_timeoutID)
		clearTimeout(s_menu_timeoutID)

	hideMenus();

	var oSubmenu = document.getElementById(oMenu.getAttribute("menuID"));
	if (oSubmenu)
	{
		left = 0;
		top = 0;
		oCursor = oMenu
		while (oCursor != null)
		{
			left += oCursor.offsetLeft;
			top += oCursor.offsetTop;
			oCursor = oCursor.offsetParent;
		}

		oSubmenu.style.left = left + 1 + "px";
		oSubmenu.style.top = top + oMenu.offsetHeight + "px";
		oSubmenu.style.visibility = "visible";
		o_menu_Current = oSubmenu;
		b_menu_Expanded = true;

		hideOverlappingControls(oSubmenu);
	}
}

function initMenuCleanup()
{
	if (s_menu_timeoutID)
		clearTimeout(s_menu_timeoutID)

	s_menu_timeoutID = setTimeout("closeUnusedMenus()", 400);
}

function closeUnusedMenus()
{
	if (!b_menu_MouseOver)
	{
		hideMenus();
		makeAllControlsVisible();
	}
	s_menu_timeoutID = 0;
}

function setInnerText(el, text)
{
	if (el.innerText)
		el.innerText = text;
	else
	{
		while (el.hasChildNodes())
			el.removeChild(this.lastChild);
		el.appendChild(document.createTextNode(text));
	}
}

function getInnerText(el)
{
	var text = "";

	if (el.innerText)
		text = el.innerText;
	else
	{
		for (var i = 0; i < el.childNodes.length; i++)
		{
			if (el.childNodes[i].nodeType == 3)
				text += el.childNodes[i].nodeValue;
			else if (el.childNodes[i].nodeType == 1)
				text += getInnerText(el.childNodes[i]);
		}
	}

	return text;
}
