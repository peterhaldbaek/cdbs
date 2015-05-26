CLI for the CDBS dataset of FCC
===============================

[![Build Status](https://travis-ci.org/peterhaldbaek/cdbs.svg?branch=master)](https://travis-ci.org/peterhaldbaek/cdbs)

The FCC (Federal Communications Commission) have made several datasets
available online. One of these datasets is the CDBS (Consolidated Public
Database System). The dataset is huge and can be downloaded as separate data
files but importing these into a database is somewhat of a challenge since
table definitions are not delivered in a standard format and the data files
come as character delimited text files.

To make the data more accessible this tool automates the download, extracting,
and parsing of the data files into database scripts containing both table
definitions and actual scripts with the data.

The scripts have been tested with MySQL. Support for other databases have not
been examined although the insert scripts are ANSI SQL and should be compatible
with most databases whereas the table definitions scripts probably need to be
tweaked to support other databases. 


Installation
------------

The tool has been implemented in Node. If Node is not available on your system
please install it from <https://nodejs.org/>. After Node has been installed run

```bash
$ npm install cdbs
```

This will make `cdbs` available in your current directory. If you want it to be
available globally run the `npm` command with the global option.

```bash
$ npm install -g cdbs
```


Usage
-----

For quick help simply call the command with the `-h` option. This will display
a short summary of the available commands of the tool.

```bash
$ cdbs -h
Usage: cdbs <command> [options]

Commands:
  init     Downloads and extracts the CDBS data.                                
  list     Lists the names of all tables.                                       
  parse    Parses the data into SQL files. If a table is specified it only
           parses the data for the specific table.                              

Options:
  -t, --table  Name of the table to parse. Default is all tables.               
  -h           Show help                                                        
```

First step is to download and extract the CDBS database to your local machine.
This can be done by calling

```bash
$ cdbs init
```

When this has completed (it can take some time) you can create SQL scripts by
calling the `parse` command. If no table is specified scripts for all tables
will be created; otherwise the command will only create the SQL script for the
specific table.

SQL scripts are put into the `data/sql` folder. The table definition script is
named after the table ie. `application.sql` for the application table and the
insert script is appended with `-data` ie. `application-data.sql`.

Please note that no relational references are created between tables. According
to the FCC all tables with the `application_id` field refers to the application
table but since the data does not seem to be consistent (records with
non-existing application ids) these constraints can unfortunately not be
applied.

### Example

```bash
# Downloads and extracts the CDBS dataset
$ cdbs init
Downloading               [==============================================] 100% 
Extracting                [==============================================] 100% 

# Creates SQL scripts for the party table
$ cdbs parse -t party
party                     [==============================================] 100% 
```


Importing into MySQL
--------------------

Currently the SQL scripts need to be imported manually into MySQL (or any other
database for that matter). To do this make sure you have created a user and a
database for the user.

```bash
# Log in as root
$ mysql -u root

# Create the user
mysql> CREATE USER 'cdbs'@'localhost' IDENTIFIED BY 'cdbs';
mysql> exit

# Login as new user
$ mysql -u cdbs -p cdbs

# Create database
mysql> CREATE DATABASE cdbs;
mysql> exit

# Import table (in this case the application table)
$ mysql -u cdbs cdbs < application.sql

# Import data.
$ mysql -u cdbs cdbs < application-data.sql
```


Limitations
-----------

The tool only downloads the `all-cdbs-files.zip` file. The
ownership_other_int_xml_data, DTV White Space files, and the 2009 Biennial
Ownership Data files are not downloaded.


Contributing
------------

Feel free to contribute with pull requests if things are not working as you
expected or if you have any improvements or suggestions. Contact me directly or
cc me on the issue or pull request since I will probably not notice your
request otherwise.


Links
-----

 - The FCC - <http://www.fcc.gov>
 - CDBS - <http://transition.fcc.gov/mb/databases/cdbs>
