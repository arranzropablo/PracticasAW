module.exports={
    calcularEdad: function(currentDate, birth) {
        let birthDate = birth.split("/");
        if (birthDate[1] < (currentDate.getMonth() + 1)) {
            return currentDate.getFullYear() - birthDate[2];
        } else if (birthDate[1] == (currentDate.getMonth() + 1)) {
            if (birthDate[0] <= currentDate.getDate()) {
                return currentDate.getFullYear() - birthDate[2];
            } else {
                return currentDate.getFullYear() - birthDate[2] - 1;
            }
        } else if (birthDate[1] > (currentDate.getMonth() + 1)) {
            return currentDate.getFullYear() - birthDate[2] - 1;
        }
    }
}