# App Overview

_This section is under construction._

---

# Event Model

## Event Model

This section documents the WhatsFresh event types and their relationships.

```mermaid
flowchart LR

  userLogin["userLogin<br>(:userEmail, :enteredPassword)"]
  userAcctList["userAcctList<br>(:userID)"]
  ingrTypeList["ingrTypeList<br>(:acctID)"]
  ingrList["ingrList<br>(:acctID, :ingrTypeID)"]
  ingrBtchList["ingrBtchList<br>(:ingrID)"]
  prodTypeList["prodTypeList<br>(:acctID)"]
  prodList["prodList<br>(:acctID, :prodTypeID)"]
  taskList["taskList<br>(:prodTypeID)"]
  prodBtchList["prodBtchList<br>(:prodID)"]
  brndList["brndList<br>(:acctID)"]
  vndrList["vndrList<br>(:acctID)"]
  wrkrList["wrkrList<br>(:acctID)"]
  measList["measList<br>(:acctID)"]
  rcpeList["rcpeList<br>(:prodID)"]
  btchMapList["btchMapList<br>(:prodbtchID)"]
  btchMapIngrList["btchMapIngrList<br>(:prodID)"]
  btchMapMapped["btchMapMapped<br>(:acctID, :prodBtchID, :ingrID)"]
  btchMapAvailable["btchMapAvailable<br>(:acctID, :prodBtchID, :ingrID)"]

  userLogin --> userAcctList
  userAcctList --> ingrTypeList
  userAcctList --> prodTypeList
  userAcctList --> brndList
  userAcctList --> vndrList
  userAcctList --> wrkrList
  userAcctList --> measList
  ingrTypeList --> ingrList
  ingrList --> ingrBtchList
  ingrBtchList --> btchmapAvailable
  ingrBtchList --> btchMapMapped
  prodTypeList --> prodList
  prodTypeList --> taskList
  prodList --> prodBtchList
  prodList --> rcpeList
  taskList --> prodBtchTaskList
  prodBtchList --> btchMapList
  prodBtchList --> prodBtchTaskList
  brndList --> ingrBtchList
  vndrList --> ingrBtchList
  wrkrList --> prodBtchTaskList
  rcpeList --> btchMapList
  btchMapList --> btchMapIngrList
  btchMapList --> btchMapMapped
  btchMapList --> btchMapAvailable

```


> If the diagram above doesn't render, see the image version: ![Event Diagram](event-diagram.png)

More details coming soon, including descriptions and examples for each event category.

---

# Pages & Previews

_This section is under construction._

---

# UI Widgets

_This section is under construction._

---

# Data Flow Overview

_This section is under construction._