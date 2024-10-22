
const dummyUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedpassword1',
        twoFASecret: 'secret1',
        role: 'user'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'hashedpassword2',
        twoFASecret: 'secret2',
        role: 'admin'
    }
];

exports.dummyUsers = dummyUsers;
