//! import AsyncStorage from '@react-native-async-storage/async-storage';
//! import { FileSystem } from 'react-native-file-access';
import CryptoJS from 'crypto-js';
import { FileSystem } from 'react-native-unimodules';
// TODO save bookmarks
// TODO save activation
// TODO encode bookmarks
// TODO encode actiavtion
let database = [
    {
        title: '01ضخامة الكبد والطحال',
        subject: 'التشريح',
        code: 'التشريح',
        last_time: '2021-01-01',
        index: 0,
        questions: [
            {
                title: 'يكون الكبد مسموع طبلياً في الحالات التالية عدا:',
                right_answer: 'خيار 1عربي',
                explanation: '',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            },
            {
                title: 'أي من حالات تضخم الكبد التالية تكون مؤلمة عند الجس:',
                right_answer: 'خيار 1عربي',
                explanation: 'question explanation',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            },
            {
                title: 'يكون الطحال متضخما في الحالات التالية عدا:',
                right_answer: 'خيار 1عربي',
                explanation: 'question explanation',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            }
        ],
        taken_number: 0,
        paid: true,
        cycle_university: '' || '-',
        answered_wrong: [],
        average_time: [],
        average_accuracy: [],
        estimated_time_for_question: 45,
        path: null,



        update_answered_wrong(new_data) {
            this.answered_wrong.push(new_data)
        },
        get_answered_wrong() {
            return this.answered_wrong
        },


        update_average_time(new_time) {
            this.average_time.push(new_time)
        },
        get_average_time() {
            if (this.average_time.length >= 1) {
                let math = Math.ceil(this.average_time.reduce((a, b) => a + b) / this.average_time.length)

                return Math.ceil(math / 60)
            }
            return 0
        },


        update_average_accuracy(new_score) {
            this.average_accuracy.push(new_score)
        },
        get_average_accuracy() {
            if (this.average_accuracy.length >= 1) {
                return Math.ceil(this.average_accuracy.reduce((a, b) => a + b) / this.average_accuracy.length)
            }
            return 0
        },
        get_last_time() {
            return this.last_time
        },
        is_paid() {
            return this.paid
        },
        get_question(index) {
            return this.questions[index]
        },
        get_estimated_time() {
            if (this.questions.length > 1) {
                let time = ((this.questions.length * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
                if (time.length == 4) {
                    time.unshift('0')
                    time[2] = ':'
                    return time.join('')
                }
                time[2] = ':'
                return time.join('')
            }
            return '00:45'
        },
        get_remaining_time(index) {
            let diff = this.questions.length - index;
            diff == 1 ? diff = 0.6 : diff = diff
            let time = ((diff * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
            if (time.length == 4) {
                time.unshift('0')
                time[2] = ':'
                return time.join('')
            }
            time[2] = ':'

            return time.join('')
        },
        set_estimated_time_per_question(time) {
            this.estimated_time_for_question = time
        },
        get_questions_number() {
            return this.questions.length
        },
        set_index(number) {
            this.index = number
        },
        get_index() {
            return { index: this.index, ratio: (this.index / this.questions.length) * 100 }
        },
        is_cycle() {
            return this.cycle_university.length > 3 ? true : false;
        },
        get_shuffled_questions(onlyQuestions = true, onlyChoices = true) {
            if (onlyQuestions) {
                let array = this.questions
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                this.questions = array
            }

            if (onlyChoices) {

                for (let i = 0; i < this.questions.length; i++) {
                    let choices_array = this.questions[i].choices
                    for (let i = choices_array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [choices_array[i], choices_array[j]] = [choices_array[j], choices_array[i]];
                    }
                    this.questions[i].choices = choices_array
                }
            }
        }
    },
    {
        title: '06ضخامة الكبد والطحال',
        subject: 'التشريح',
        code: '240101',
        last_time: '2021-03-15',
        index: 0,
        questions: [
            {
                title: 'يكون الكبد مسموع طبلياً في الحالات التالية عدا:',
                right_answer: 'خيار 1عربي',
                explanation: 'question explanation',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            },
            {
                title: 'أي من حالات تضخم الكبد التالية تكون مؤلمة عند الجس:',
                right_answer: 'خيار 1عربي',
                explanation: 'question explanation',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            },
            {
                title: 'يكون الطحال متضخما في الحالات التالية عدا:',
                right_answer: 'خيار 1عربي',
                explanation: 'question explanation',
                choices: ['خيار3 عربي', 'خيار2 عربي', 'خيار 1عربي', 'sssssss عربي', '-'],
                answered_wrong: 0,
                set_explanation(data) {
                    this.explnation = data
                },
                set_answered_wrong(number) {
                    this.answered_wrong += number
                },
                is_right(d) {
                    return d == this.right_answer ? true : false
                },
                has_explanation() {
                    return this.explanation.length > 3 ? true : false
                }
            }
        ],
        taken_number: 0,
        paid: true,
        cycle_university: '' || '-',
        answered_wrong: [],
        average_time: [],
        average_accuracy: [],
        estimated_time_for_question: 45,
        path: null,
        set_path(path) {
            this.path = path
        },


        update_answered_wrong(new_data) {
            this.answered_wrong.push(new_data)
        },
        get_answered_wrong() {
            return this.answered_wrong
        },


        update_average_time(new_time) {
            this.average_time.push(new_time)
        },
        get_average_time() {
            if (this.average_time.length >= 1) {
                let math = Math.ceil(this.average_time.reduce((a, b) => a + b) / this.average_time.length)

                return Math.ceil(math / 60)
            }
            return 0
        },


        update_average_accuracy(new_score) {
            this.average_accuracy.push(new_score)
        },
        get_average_accuracy() {
            if (this.average_accuracy.length >= 1) {
                return Math.ceil(this.average_accuracy.reduce((a, b) => a + b) / this.average_accuracy.length)
            }
            return 0
        },
        get_last_time() {
            return this.last_time
        },
        is_paid() {
            return this.paid
        },
        get_question(index) {
            return this.questions[index]
        },
        get_estimated_time() {
            if (this.questions.length > 1) {
                let time = ((this.questions.length * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
                if (time.length == 4) {
                    time.unshift('0')
                    time[2] = ':'
                    return time.join('')
                }
                time[2] = ':'
                return time.join('')
            }
            return '00:45'
        },
        get_remaining_time(index) {
            let diff = this.questions.length - index;
            diff == 1 ? diff = 0.6 : diff = diff
            let time = ((diff * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
            if (time.length == 4) {
                time.unshift('0')
                time[2] = ':'
                return time.join('')
            }
            time[2] = ':'

            return time.join('')
        },
        set_estimated_time_per_question(time) {
            this.estimated_time_for_question = time
        },
        get_questions_number() {
            return this.questions.length
        },
        set_index(number) {
            this.index = number
        },
        get_index() {
            return { index: this.index, ratio: (this.index / this.questions.length) * 100 }
        },
        is_cycle() {
            return this.cycle_university.length > 3 ? true : false;
        },
        get_shuffled_questions(onlyQuestions = true, onlyChoices = true) {
            if (onlyQuestions) {
                let array = this.questions
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                this.questions = array
            }

            if (onlyChoices) {

                for (let i = 0; i < this.questions.length; i++) {
                    let choices_array = this.questions[i].choices
                    for (let i = choices_array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [choices_array[i], choices_array[j]] = [choices_array[j], choices_array[i]];
                    }
                    this.questions[i].choices = choices_array
                }
            }
        }
    }]
let bookmarks = [
]
let act = [
    {
        code: '240101',
        en: '1gorbvvvbp8k',
        valid: false
    },
    {
        code: '250102',
        en: '1gorbfasfd8k',
        valid: true
    }
]
function get_database() {
    return database
}
function update_database(update) {
    database = update
}

function get_bookmarks() {
    return bookmarks
}
async function update_bookmarks(update) {
    bookmarks = update;
    try {
        const jsonValue = JSON.stringify(bookmarks)
        await AsyncStorage.setItem('@bookmarks', CryptoJS.AES.encrypt(jsonValue, 'nabeeladnanalinizam_20900!@#()').toString())
    } catch (e) {
    }
}

function get_act() {
    return act
}
function is_quiz_valid(code) {
    if (act.filter(i => i.code == code)[0].valid) return true
    return false
}
async function update_act(data) {
    act = data;
    try {
        const jsonValue = JSON.stringify(act)
        await AsyncStorage.setItem('@act', CryptoJS.AES.encrypt(jsonValue, 'nabeeladnanalinizam_20900!@#()').toString())
    } catch (e) {
    }
}
async function save_file(quiz) {
    let path = quiz.path;
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
    FileSystem.writeFile(path, encrypted)
}
function get_quotes() {
    let data = [
        'Prefixes:\n A-/ or an-/ => Without or lack of',
        'Prefixes:\n Bi- or bin- => Two',
        'Prefixes:\n Brady => Slow',
        'Prefixes:\n Dys- => Difficult, painful, uncomfortable',
        'Prefixes:\n Endo- => Within',
        'Prefixes:\n Epi- => On, over, upon',
        'Prefixes:\n Eu- => Normal',
        'Prefixes:\n Ex-, exo- => Outside, outward',
        'Prefixes:\n Hemi- => Half',
        'Prefixes:\n Hydro- => Water',
        'Prefixes:\n Hyper => Excessive, above normal',
        'Prefixes:\n Hypo- => Below normal',
        'Prefixes:\n Inter- => Between',
        'Prefixes:\n Intra- => Within',

        'Prefixes:\n Nulli- => None',
        'Prefixes:\n Pan- => All',
        'Prefixes:\n Para- => Abnormal',
        'Prefixes:\n Para- => Beside, beyond, around',
        'Prefixes:\n Per => Through',

        'Prefixes:\n Peri- => Around',
        'Prefixes:\n Polio- => Gray',
        'Prefixes:\n Poly- => Many, much',
        'Prefixes:\n Primi- => First',
        'Prefixes:\n Quadri- => Four',

        'Prefixes:\n Re- => Back',
        'Prefixes:\n Retro- => Backward, back',
        'Prefixes:\n Secundi- => Second',
        'Prefixes:\n Sub- => Below, under',
        'Prefixes:\n Trans- => Through, across, beyond',

        'Suffixes:\n -algia => Pain',
        'Suffixes:\n -apheresis =>Removal',
        'Suffixes:\n -ar, -ary => Pertaining to',
        'Suffixes:\n -ase => Enzyme',
        'Suffixes:\n -blast => Immature',

        'Suffixes:\n -capnia => Carbon dioxide',
        'Suffixes:\n -centesis => Surgical puncture with needle to aspirate fluid',
        'Suffixes:\n -chalasis => Relaxation',
        'Suffixes:\n -continence => To stop',


        'Suffixes:\n -cusis => Hearing',
        'Suffixes:\n -cyesis => Pregnancy',
        'Suffixes:\n -cytosis => Condition of cells',
        'Suffixes:\n -drome => Run, running',
        'Suffixes:\n -desis => Surgical fixation',

        'Suffixes:\n -ectasis => Stretching or expansion',
        'Suffixes:\n -ectomy => Surgical removal or excision',
        'Suffixes:\n -emia => A blood condition',
        'Suffixes:\n -flux => Flow',
        'Suffixes:\n -gen => Producing',

        'Suffixes:\n -genesis => Production',
        'Suffixes:\n -globin => Protein',
        'Suffixes:\n -globulin => Protein',
        'Suffixes:\n -gram => Picture or finished record',
        'Suffixes:\n -graph => Instrument used to record',

        'Suffixes:\n -graphy => Process of recording',
        'Suffixes:\n -iasis => Abnormal condition',
        'Suffixes:\n -ician => One who',
        'Suffixes:\n -ism => State of or condition',
        'Suffixes:\n -itis => Inflammation',

        'Suffixes:\n -lithiasis => Calculus or stone',
        'Suffixes:\n -lysis => Loosening, separating',
        'Suffixes:\n -lytic => Destruction or breakdown',
        'Suffixes:\n -malacia => Softening',
        'Suffixes:\n -megaly => Enlargement',

        'Suffixes:\n -metrist => Specialist in the measurement of',
        'Suffixes:\n -metry => Process of measuring',
        'Suffixes:\n -lytic => Destruction or breakdown',
        'Suffixes:\n -ology => Study of',
        'Suffixes:\n -oma => Tumor or mass',
    ]
    return data
}
export { get_database, update_database, get_bookmarks, update_bookmarks, get_act, update_act, save_file, get_quotes, is_quiz_valid }